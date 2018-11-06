import {Component, EventEmitter, Input, OnInit, Output, Pipe, PipeTransform} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

interface Dimension {
  aggregation: string;
  data_options: object;
  display_name: string;
  id: number;
  options: object;
  type: string;
  value?: string;
  values?: object[];
  excluded?: boolean;
}

/**
 * Pipe to check if value is a valid date
 */
@Pipe({name: 'isDate'})
export class IsDatePipe implements PipeTransform {
  transform(value: string): any {
    return Date.parse(value);
  }
}

@Component({
  selector: 'aa-filter',
  templateUrl: './aafilter.component.html',
  styleUrls: ['./aafilter.component.scss']
})
export class AafilterComponent implements OnInit {

  dimensionSelected = {} as Dimension;
  query: object[];
  queryResults: any;
  queryResultsFound: any;
  searchValue: string;
  areAllChecked: boolean;
  conditions: object[] = [];
  spinner: boolean;
  httpOptions: any;

  @Input() endpoint: string;
  @Input() cardEndpoint: string;
  @Input() authToken: string;
  @Input() dimensions: Dimension[];
  @Input() inputQueryResults: any;
  @Output() outputQuery = new EventEmitter();
  @Output() outputResults = new EventEmitter();

  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    // this.dimensionSelected = {id: null};

    if (!this.endpoint) {
      this.endpoint = 'http://localhost:9000/api/v2/sources/2';
      this.cardEndpoint = 'http://localhost:9000/api/v2/decks/1/cards/17';
    }

    // Set headers
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.authToken
      })
    };

    // Requests
    if (!this.dimensions) {
      this.getRequest();
    }

  }

  /**
   * GET card dimensions
   */
  private getRequest() {
    this.http.get(this.cardEndpoint, this.httpOptions)
      .subscribe((res): any => {
        this.dimensions = res['data_source'].dimensions
          .filter(d => d.type !== 'measure')
          .sort((a, b) => {
            if (a.display_name < b.display_name) {
              return -1;
            }
            return 1;
          });
      }, err => {
        console.log(err);
      });
  }

  /**
   * POST dimension queries
   */
  private postRequest() {
    this.dimensionSelected['dimmed'] = [];

    // Build query
    this.query = [
      {
        'fields': [{
          name: this.dimensionSelected.display_name,
          alias: 'name'
        }],
        'simple': true
      }
    ];

    // filter conditions for dimension selected
    const cond = this.conditions.filter(e => {
      return e['name'] !== this.dimensionSelected.display_name;
    });
    if (cond.length > 0) {
      this.query.push(
        {
          'fields': [{
            name: this.dimensionSelected.display_name,
            alias: 'name'
          }],
          'filter': {
            'conditions': cond
          },
          'simple': true
        }
      );
    }

    // Output query
    this.outputQuery.emit(this.query);

    // Request
    this.http.post(`${this.endpoint}?action=query`, this.query, this.httpOptions)
      .subscribe((res): any => {
        this.spinner = false;
        let resp: any = res;
        if (this.conditions.length > 0) {
          if (this.dimensions.find(obj => obj.display_name === this.dimensionSelected.display_name).values) {
            resp = this.dimensions.find(obj => obj.display_name === this.dimensionSelected.display_name).values;
          } else {
            resp = res[0];
          }

          // Dim / Disable results
          if (cond.length > 0) {
            this.dimensionSelected['dimmed'] = res[1].map(r => r.name);
            resp.forEach(re => {
              re.dimmed = !this.dimensionSelected['dimmed'].includes(re.name);
              re.checked = !!(re.checked && this.dimensionSelected['dimmed'].includes(re.name));
            });
          }
        }

        // Sort and assign Results
        this.queryResults = this.queryResultsFound = resp.sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          return 1;
        });

        // dimension values
        this.dimensions.forEach(d => {
          if (d.display_name === this.dimensionSelected.display_name) {
            d.values = resp;
          }
        });

        this.buildConditions();
      }, err => {
        this.spinner = false;
        console.log(err);
      });
  }

  /**
   * Select dimension
   * @param dimension --> Dimension selected
   */
  selectDimension(dimension: Dimension) {
    this.spinner = true;
    this.dimensionSelected = dimension;
    this.areAllChecked = false;
    this.queryResultsFound = null;
    this.searchValue = '';

    // Check if dimensions have been loaded before
    this.dimensions.forEach((d, i) => {
      if (d.display_name === dimension.display_name && d.values) {
        this.queryResults = d.values;
        this.queryResultsFound = d.values;
        this.allChecked();
      }
      if (i === this.dimensions.length - 1) {
        this.postRequest();
      }
    });
  }

  /**
   * Select / Deselect all
   */
  selectAll() {
    if (this.areAllChecked) {
      this.queryResultsFound.forEach(qr => {
        qr.checked = !qr.dimmed;
      });
    } else {
      this.queryResultsFound.forEach(qr => qr.checked = false);
    }
  }

  /**
   * Check if all checkboxes are checked
   */
  allChecked() {
    this.areAllChecked = this.queryResultsFound.every(qr => qr.checked);
    // if all unchecked  && no conditions, remove dimmed
    if (this.queryResultsFound.every(qr => !qr.checked) && this.conditions.length === 0) {
      this.dimensionSelected['dimmed'] = [];
    }
  }

  /**
   * Search
   */
  search() {
    // TODO: improve search for date, at the moment searching original date not the one displayed after angular pipe applied
    if (this.searchValue.length === 0) {
      this.queryResultsFound = this.queryResults;
    } else {
      this.queryResultsFound = this.queryResults.filter(qrf => {
        if (qrf.name.toLowerCase().includes(this.searchValue.toLowerCase())) {
          return qrf;
        }
      });
    }
    this.allChecked();
  }

  /**
   * Build conditions
   * @param cond -->  removes 'cond' from 'this.conditions'
   */
  buildConditions(cond?) {
    if (!cond) {
      cond = '';
    }
    this.conditions = [];
    let condition;
    let key;

    this.dimensions.forEach(d => {
      key = d.excluded ? 'nin' : 'in';

      if (d.values) {
        condition = {
          'name': d.display_name,
        };
        condition[key] = d.values.map(v => {
          if (cond.name === d.display_name) {
            v['checked'] = false;
          } else if (v['checked']) {
            return v['name'];
          }
        }).filter(e => e); // filter undefined values
        if (condition[key].length > 0) {
          this.conditions.push(condition);
        }
      }
    });
    this.allChecked();
    // if conditions chip deleted
    if (cond) {
      this.postRequest();
    }
  }

  /**
   * Exclude option
   * @param e --> param
   */
  exclude(e) {
    this.dimensions.forEach(d => {
      if (d.display_name === this.dimensionSelected.display_name) {
        d.excluded = e.checked;
      }
    });
    this.buildConditions();
  }
}

