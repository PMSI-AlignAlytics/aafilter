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
  transform(value: string): any {
    return Date.parse(value);
  }
}

/**
 * Display date format pipe
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

  @Input() endpoint: string;
  @Input() cardEndpoint: string;
  @Input() authToken: string;
  @Input() dimensions: Dimension[];
  @Input() inputQueryResults: any;
  @Input() event: string;
  @Output() outputConditions = new EventEmitter();
  @Output() outputResults = new EventEmitter();

  groups: DimensionGroup[];


  constructor(private http: HttpClient) {
  }

  ngOnInit() {

    if (!this.endpoint) {
      this.endpoint = 'http://localhost:9000/api/v2/sources/1';
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes.event.currentValue === 'close') {
      console.log(this.conditions);
      this.postRequest(true);
    }
  }

  /**
   * GET card dimensions
   */
  private getRequest() {
    this.http.get(this.cardEndpoint, this.httpOptions)
      .subscribe((res): any => {

        this.dimensions = res['data_source'].dimensions
          .filter(d => d.type !== 'measure' && d.type !== 'geo') // remove type measure
          .sort((a, b) => {
            if (a.display_name < b.display_name) {
              return -1;
            }
            return 1;
          });

        this.groupDimensions(this.dimensions);
      }, err => {
        console.log(err);
      });
  }

  /**
   * POST dimension queries
   */
  private postRequest(close?) {

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

    if (close) {
      // Output conditions: has to go before deleting format!!
      this.outputConditions.emit(JSON.stringify(this.conditions));
    }


    // filter conditions for dimension selected if not closing
    const cond = this.conditions.filter(e => {
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

          // Dim / Disable results|
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
          'format': d.options['format']
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
    const oLookup = {},
      result = [];

    //     // Sort the dimension's name in ascending order first
    //     // Sort the dimension's display group in ascending order second
    //     var data = angular.copy(items);

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
}

// Used to test grouping
// let items = [{
//   'id': 31783,
//   'display_name': 'Result (level 2)',
//   'type': 'category',
//   'options': {'multiple': false, 'display_group': 'Result', 'uniques': 2}
// }, {
//   'id': 31772,
//   'display_name': 'Date',
//   'type': 'time',
//   'options': {'format': '%d-%B-%y', 'uniques': 4, 'display_group': 'Date'}
// }, {
//   'id': 31775,
//   'display_name': 'Column',
//   'type': 'category',
//   'options': {'multiple': false, 'display_group': 'Field', 'uniques': 14}
// }, {
//   'id': 31779,
//   'display_name': 'Issue score',
//   'type': 'measure',
//   'options': {'fixed': '2', 'suffix': '%', 'display_group': 'Result'}
// }, {
//   'id': 31780,
//   'display_name': 'Parameter_1',
//   'type': 'measure',
//   'options': {'display_group': 'Rule'},
//   'aggregation': 'avg'
// }, {
//   'id': 31776,
//   'display_name': 'Rule name',
//   'type': 'category',
//   'options': {'multiple': false, 'uniques': 2, 'display_group': 'Rule'}
// }, {'id': 31777, 'display_name': 'Issue count', 'type': 'measure', 'options': {'display_group': 'Result'}}, {
//   'id': 31781,
//   'display_name': 'Parameter_2',
//   'type': 'measure',
//   'options': {'display_group': 'Rule'},
//   'aggregation': 'avg'
// }, {
//   'id': 31774,
//   'display_name': 'Datasource',
//   'type': 'category',
//   'options': {'multiple': false, 'display_group': 'Field', 'uniques': 2}
// }, {
//   'id': 31773,
//   'display_name': 'Project',
//   'type': 'category',
//   'options': {'multiple': false, 'display_group': 'Category', 'uniques': 1}
// }, {
//   'id': 31771,
//   'display_name': 'Rank',
//   'type': 'category',
//   'options': {'multiple': false, 'display_group': 'Date', 'uniques': 7}
// }, {'id': 31778, 'display_name': 'Rows total', 'type': 'measure', 'options': {'display_group': 'Counts'}}, {
//   'id': 31811,
//   'display_name': 'Column value',
//   'type': 'category',
//   'options': {'uniques': 20, 'display_group': 'Field'}
// }, {'id': 31810, 'display_name': 'Level', 'type': 'category', 'options': {'uniques': 2, 'display_group': 'Rule'}}, {
//   'id': 31782,
//   'display_name': 'Threshold',
//   'type': 'measure',
//   'options': {'display_group': 'Rule'},
//   'aggregation': 'avg'
// }, {'id': 31861, 'display_name': 'Rule Type', 'type': 'category', 'options': {'display_group': 'Rule', 'uniques': 2}}, {
//   'id': 31812,
//   'display_name': 'Test count',
//   'type': 'measure',
//   'options': {'display_group': 'Counts'},
//   'aggregation': 'countdist'
// }, {
//   'id': 31770,
//   'display_name': 'Count',
//   'type': 'measure',
//   'options': {'display_group': 'Counts'},
//   'aggregation': 'sum'
// }, {'id': 31860, 'display_name': 'Tag', 'type': 'category', 'options': {'uniques': 8, 'display_group': 'Category'}}, {
//   'id': 31862,
//   'display_name': 'Description',
//   'type': 'category',
//   'options': {'display_group': 'Rule', 'uniques': 14}
// }, {'id': 32165, 'display_name': 'Result', 'type': 'category', 'options': {'display_group': 'Result', 'uniques': 2}}];
