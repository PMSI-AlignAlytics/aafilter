import {Component, EventEmitter, Input, OnChanges, OnInit, Output, Pipe, PipeTransform, SimpleChanges} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import * as d3 from 'd3-time-format';

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

interface DimensionGroup {
  items: [Dimension];
  key: '';
}

// TODO: improve Date pipes and update documentation
// No name was provided for external module 'd3-time-format' in output.globals – guessing 'd3'
/**
 * Pipe to check if value is a valid date
 */
@Pipe({name: 'isDate'})
export class IsDatePipe implements PipeTransform {
  transform(value: any): any {
    // if (value.toLowerCase().includes('quarter') || Number(value)) {
    //   return null;
    // }
    // return Date.parse(value);
    return value instanceof Date && !isNaN(Number(value));
  }
}

/**
 * Display date format pipes
 */
@Pipe({name: 'displayFormat'})
export class DisplayFormatPipe implements PipeTransform {
  transform(value: any, format): any {
    value = new Date(value);
    if (format && d3.timeFormat('%Y-%m-%dT%H:%M:%S.%LZ')(value)) {
      return d3.timeFormat(format)(value);
    } else if (format && !isNaN(Date.parse(value))) {
      return d3.timeFormat(format)(new Date(value));
    } else {
      return value;
    }
  }
}

@Component({
  selector: 'aa-filter',
  templateUrl: './aafilter.component.html',
  styleUrls: ['./aafilter.component.scss']
})
export class AafilterComponent implements OnInit, OnChanges {

  dimensionSelected = {} as Dimension;
  query: object[];
  queryResults: any;
  queryResultsFound: any;
  searchValue: string;
  areAllChecked: boolean;
  conditions: object[] = [];
  spinner: boolean;
  httpOptions: any;
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  hideShowDimmed = true;

  @Input() queryEndpoint: string;
  @Input() dimensionsEndpoint: string;
  @Input() authToken: string;
  @Input() dimensions: Dimension[];
  @Input() externalConditions: any;
  @Input() event: string;
  @Output() outputConditions = new EventEmitter();
  @Output() outputResults = new EventEmitter();

  groups: DimensionGroup[];
  inactiveValues: any;

  constructor(private http: HttpClient) {
  }

  ngOnInit() {

    // if (!this.queryEndpoint) {
    //   this.queryEndpoint = 'http://localhost:9000/api/v2/sources/1';
    //   this.dimensionsEndpoint = 'http://localhost:9000/api/v2/decks/1/cards/17';
    // }

    // Set headers
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=UTF-8',
        /** Add this line for dev **/
        'Authorization': this.authToken
      })
    };

    // Requests
    if (!this.dimensions) {
      this.getRequest();
    }

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.event.currentValue === 'close') { // to detects when dialog from app closes
      this.postRequest(true);
    }
  }

  /**
   * GET card dimensions
   */
  private getRequest() {
    this.http.get(this.dimensionsEndpoint, this.httpOptions)
      .subscribe((res: any): any => {
        /** change this.dimensions line for dev **/
        this.dimensions = res['data_source'].dimensions // dev
          // this.dimensions = res.dimensions // prod
          .filter(d => d.type !== 'measure' && d.type !== 'geo') // remove type measure and geo
          .sort((a, b) => {
            if (a.display_name < b.display_name) {
              return -1;
            }
            return 1;
          });

        this.groupDimensions(this.dimensions);

        // External conditions from app
        if (this.externalConditions) {
          this.dimensions.forEach(d => {
            this.externalConditions.forEach(ec => {
              if (ec.name === d.display_name) {
                d.values = [];
                if (ec['in']) {
                  ec['in'].forEach(ccin => {
                    d.values.push({
                      name: ccin,
                      checked: true
                    });
                  });
                } else if (ec['nin']) {
                  d.excluded = true;
                  ec['nin'].forEach(ccnin => {
                    d.values.push({
                      name: ccnin,
                      checked: true
                    });
                  });
                }
              }
            });
          });
        }
        this.buildConditions();
      }, err => {
        console.log(err);
      });
  }

  /**
   * POST dimension queries
   */
  private postRequest(close?) {
    this.dimensionSelected['dimmed'] = [];

    const name = this.dimensionSelected.display_name;

    // Build query
    this.query = [
      {
        'fields': [{
          'name': name,
          'alias': 'name'
        }],
        'simple': true
      }
    ];

    // Send conditions when closing dialog
    if (close) {
      // Output conditions: has to go before deleting format!!
      this.outputConditions.emit(JSON.stringify(this.conditions));
    }

    // delete format and filter conditions for dimension selected if not closing
    let cond = this.conditions.map(x => Object.assign({}, x));
    cond = cond.filter(e => {
      delete e['format'];
      if (!close) {
        return e['name'] !== this.dimensionSelected.display_name;
      }
      return e;
    });

    if (cond.length > 0) {
      this.query.push(
        {
          'fields': [{
            'name': name,
            'alias': 'name'
          }],
          'filter': {
            'conditions': cond
          },
          'simple': true
        }
      );
    }

    if (!close) {
      // get values stored in dimension
      const values = this.dimensions.find(obj => obj.display_name === this.dimensionSelected.display_name).values;
      const dimensionSelected = this.dimensionSelected;
      // Request
      this.http.post(`${this.queryEndpoint}?action=query`, this.query, this.httpOptions)
        .subscribe((res: any): any => {
          if (dimensionSelected === this.dimensionSelected) {
            this.spinner = false;
            let resp: any = res;
            if (this.conditions.length > 0) {
              if (values) { // if values stored in dimension
                resp = values;
                // check for extra values in the response (case when values added from external app conditions)
                const response = this.query.length > 1 ? res[0] : res;
                const string = JSON.stringify(resp);
                response.forEach(rs => {
                  if (!string.includes(rs.name)) {
                    resp.push(rs);
                  }
                });

              } else {
                resp = res[0];
                if (!resp.length) {
                  resp = res;
                }
              }

              // reset visibility icon
              this.hideShowDimmed = true;

              // Dim / Disable / hide  results
              if (cond.length > 0) {
                this.dimensionSelected['dimmed'] = res[1].map(r => r.name);
                resp.forEach(re => {
                  re.dimmed = !this.dimensionSelected['dimmed'].includes(re.name); // Dim
                  re.checked = !!(re.checked && this.dimensionSelected['dimmed'].includes(re.name)); // uncheck if dimmed
                  re.hide = false;
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
          }
        }, err => {
          this.spinner = false;
          console.log(err);
        });
    }
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
    if (this.searchValue.length === 0) {
      this.queryResultsFound = this.queryResults;
    } else {
      this.queryResultsFound = this.queryResults.filter(qrf => {
        if (this.dimensionSelected.type === 'time') { // condition to search date in the same format displayed
          let date: any = new Date(qrf.name);
          date = `${this.months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
          if (date.toLowerCase().includes(this.searchValue.toLowerCase())) {
            return qrf;
          }
        } else if (qrf.name.toLowerCase().includes(this.searchValue.toLowerCase())) {
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
          'format': d.options['format'],
          'value': d.value
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
    if (this.dimensionSelected.display_name) { // if a dimension is selected
      this.allChecked();
      // if conditions chip deleted
      if (cond) {
        this.postRequest();
      }
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

  groupDimensions(items) {
    //   function groupDimensions (items) {
    function grouping(options) {
      if (options.display_group) {
        return options.display_group;
      }
      return 'Other';
    }

    if (!items) {
      return;
    }
    const oLookup = {}, result = [];
    items.sort(function (a, b) {
      const aL = a.display_name ? a.display_name.toLowerCase() : '';
      const bL = b.display_name ? b.display_name.toLowerCase() : '';
      const aVal = a.options && a.options.display_group ? a.options.display_group.toLowerCase() : '';
      const bVal = b.options && b.options.display_group ? b.options.display_group.toLowerCase() : '';

      if (aVal > bVal) {
        return 1;
      } else if (aVal < bVal) {
        return -1;
      }
      if (aL > bL) {
        return 1;
      } else if (aL < bL) {
        return -1;
      }
      return 0;
    });

    // First find if groups are used in data
    let foundGrouping = false;
    items.forEach(function (item) {
      if (item.options && item.options.display_group) {
        foundGrouping = true;
      }
    });

    if (foundGrouping) {
      // Iterate through data and group by
      items.forEach(function (item) {
        const g = grouping(item.options);
        if (typeof oLookup[g] === 'undefined') {
          oLookup[g] = result.length;
          result[oLookup[g]] = {key: g, items: [item]};
        } else {
          result[oLookup[g]].items.push(item);
        }
      });
    } else {
      result[0] = {
        key: null,
        items: items
      };
    }

    this.groups = result;
  }

  /**
   * Hide dimmed results
   */
  hideDimmed() {
    this.hideShowDimmed = !this.hideShowDimmed;
    const inactiveValues = this.queryResultsFound.filter(qr => {
      qr['hide'] = qr['dimmed'] && !this.hideShowDimmed;
      return qr['hide'];
    });
    this.inactiveValues = inactiveValues.length;
  }
}
