// src/app/cytoscape-graph/cytoscape-graph.component.ts

import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { DatePickerService } from '../date-picker.service'; // Update the path

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BackendServiceService } from '../backend-service.service';
import { Product } from '../models/product';
import {
  dax30Stocks,
  seclvlcommands,
  priceCommandsList,
  metaPriceCommandsList,
  newsCommandsList,
  intentCommandsList,
  businessCommandsList,
  businessCommandsYearlyList,
  emotionsCommandsList,
  numbersDaysCommandsList,
  quarterCommandsList,
  yearCommandsList,
  compareCommandsList,
  metaPriceCommandsListRight,
  metaPriceCommandsListRightDelta,
} from './commands';



import * as cxtmenu from 'cytoscape-cxtmenu';
cytoscape.use( cxtmenu );
import * as cytoscape from 'cytoscape';
import { NodeSingular, EventObject } from 'cytoscape';


@Component({
  selector: 'app-cytoscape-graph',
  templateUrl: './cytoscape-graph.component.html',
  styleUrls: ['./cytoscape-graph.component.css']
})



export class CytoscapeGraphComponent implements AfterViewInit {
  topString = 'Started with: 10,000. Ended with: 10,000.';
  current_money = 10000;
  isLoading: boolean = false;
  url: string = 'http://strategy-assessment.com/';

  selectedAction = 'buy'; // Default value for action
  selectedStock = 'Bayer'; // Default value for stock

  isValid: boolean = true;

  noBackend: boolean = true;

  showMore: boolean = false;

  aiSignal!: string;
  maxLinchpins: boolean = false;
  try_it_shown: boolean = true;


  toggleMore() {
    this.showMore = !this.showMore;
  }

  constructor(private myService: BackendServiceService, private datePickerService: DatePickerService) { }


  currentDate!: Date | null;

  ngOnInit() {
    this.datePickerService.currentDate.subscribe(date => {
      //console.log("Date changed to:", this.currentDate);
      this.currentDate = date;

      // update all infonodes
      this.products.forEach(product => {
        //console.log(product.node_info_ids)
        product.node_info_ids.forEach((id, index) => {
          // Access the features using the same index
          const features = product.node_info_features[index];

          //console.log(`ID: ${id}, Features: ${features}`);
          this.updateNodeString(features, id);

        });
      });


    });
  }



  async backendTest(): Promise<void> {
    try {
      const response = await this.getStringFromBackendAsync(this.url);
      //console.log("GEHTWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWGEHT");
      // Perform further actions with the received string
      this.noBackend = false;

      //console.log(response);

    } catch (error) {
      //console.log("WERWERWERWERWERWERWERWERWERWERWERWERWER")
      console.error("Error in backendTest:", error);
      // Handle errors here
      this.noBackend = true;
    }
}


  showInfo: boolean = false;
  showInfoIcon: boolean = false;
  winnerString: string = "Awesomeeee";


  toggleInfo() {
    this.showInfo = !this.showInfo;
  }

  updateSpecialDates(dates: Date[]) {
    if (this.selectedAction == 'buy') {

      //console.log("IUS DES A BUY SIGNAL ODER WIE")
      //console.log(this.datePickerService.specialDatesSell)
      //console.log(this.datePickerService.specialDatesBuy)

      this.datePickerService.specialDatesBuy = dates;
      this.datePickerService.specialDatesSell = [];
    } else {
      //console.log("IUS DES A SELL SIGNAL ODER WIE")
      this.datePickerService.specialDatesSell = dates;
      this.datePickerService.specialDatesBuy = [];
      //console.log(this.datePickerService.specialDatesSell)
      //console.log(this.datePickerService.specialDatesBuy)
    }
  }


  getStringFromBackendAsync(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.myService.getStringFromBackend(url).subscribe(
        data => resolve(data),
        error => {
          console.error('There was an error!', error);
          reject(error);
        }
      );
    });
  }


  extractMethods(input: string): string[] {
    // Remove the outer method name and the outermost parentheses
    const outerRemoved = input.replace(/^\w+\((.*)\)$/, '$1');

    let methods: string[] = [];
    let currentMethod = '';
    let parenthesisCount = 0;

    for (let i = 0; i < outerRemoved.length; i++) {
        const char = outerRemoved[i];

        if (char === '(') {
            parenthesisCount++;
        } else if (char === ')') {
            parenthesisCount--;
        }

        if (char === ',' && parenthesisCount === 0) {
            // End of a method call
            methods.push(currentMethod.trim());
            currentMethod = '';
        } else {
            currentMethod += char;
        }
    }

    // Add the last method if there is one
    if (currentMethod.trim() !== '') {
        methods.push(currentMethod.trim());
    }

    return methods;
}

splitMethodString(input: string): string[] {
  // Extract the method name
  const methodNameMatch = input.match(/^\w+/);
  const methodName = methodNameMatch ? methodNameMatch[0] : '';

  // Extract the arguments inside the parentheses
  const argsString = input.replace(/^\w+\((.*)\)$/, '$1');
  const args = argsString.split(/,\s*/);

  // Combine the method name and the arguments
  return [methodName, ...args];
}


findIndex(commandArray: string[], searchString: string): string {
  const lowerCaseSearchString = searchString.toLowerCase();
  const foundString = commandArray.find(substring => lowerCaseSearchString.includes(substring.toLowerCase()));
  return foundString || "";
}


performNinetyDaysAdaption() {
  this.selectedStock = "Bayer";
  this.selectedAction = "buy";
  this.aiSignal = "one_and(average_value(stock_bayer(), stock_bayer(), price_open(), price_open(), day_1(), day_90(), day_1(), comparison_ri()))";
  this.performAdaption();
}

performEmotionAdaption() {
  this.selectedStock = "Bayer";
  this.selectedAction = "buy";
  this.aiSignal = "two_and(average_value(stock_bayer(), stock_bayer(), price_open(), price_open(), day_1(), day_90(), day_1(), comparison_ri()), emotions_methods(stock_bayer(), stock_henkel(), emotion_happiness(), emotion_happiness(), year_1(), year_1(), comparison_le()))";
  this.performAdaption();
}

performGood() {
  this.selectedStock = "Bayer";
  this.selectedAction = "buy";
  this.aiSignal = "two_and(quarter_methods(stock_bayer(), stock_bayer(), quarter_feature_revenue(), quarter_feature_revenue(), year_0(), year_2(), comparison_le()), value_value(stock_bayer(), stock_bayer(), price_open(), price_high(), day_3(), day_4(), comparison_ri()))"
  this.performAdaption();

}


  performAdaption() {
    //console.log("OKOKKOOKKOOKOK");

    // remove everything that happened so far.
    this.products = [];
    this.setup_cyto();

    // make all linchpins
    if (this.aiSignal.includes("two_and")) {
      this.addTriangleNodes();
    } else if (this.aiSignal.includes("three_and")) {
      this.addTriangleNodes();
      this.addTriangleNodes();
    } else if (this.aiSignal.includes("four_and")) {
      this.addTriangleNodes();
      this.addTriangleNodes();
      this.addTriangleNodes();
    }

    let methods_list = this.extractMethods(this.aiSignal);
    //console.log("WAS")
    //console.log(methods_list)

    let index_counter = 0;
    for (let product of this.products) {
      //console.log(product.left);
      //console.log(product.right);
      //console.log(product.bottom);


      let methods = this.splitMethodString(methods_list[index_counter]);
      //console.log("TOP")
      //console.log(methods)
      //console.log(dax30Stocks)
      //console.log(methods[1])
      //console.log(this.findIndex(dax30Stocks, methods[1]))

      let children = this.setCmdForNode(product.left, this.commandsStart, this.findIndex(dax30Stocks, methods[1]))

      let method = "dunno";
      // see which method we are dealing with
      const keyTerm = methods[0].includes("emotion") ? "emotion" :
                methods[0].includes("quarter") ? "quarter" :
                methods[0].includes("year") ? "year" :
                methods[0].includes("price") || methods[0].includes("value") || methods[0].includes("average") || methods[0].includes("delta") ? "price" : "";

      // Use switch statement to set the method
      switch (keyTerm) {
          case "emotion":
            // set emotion
            children = this.setCmdForNode(children[0], this.commands2, seclvlcommands[3]);
            // set which emotion it is
            children = this.setCmdForNode(children[0], this.emotionsCommands, this.findIndex(emotionsCommandsList, methods[3]));
            let quarter_string = methods[5];
            if (quarter_string.includes("1")) {
              children = this.setCmdForNode(children[0], this.quarterCommands, quarterCommandsList[0]);
            } else if (quarter_string.includes("2")) {
              children = this.setCmdForNode(children[0], this.quarterCommands, quarterCommandsList[1]);
            } else if (quarter_string.includes("3")) {
              children = this.setCmdForNode(children[0], this.quarterCommands, quarterCommandsList[2]);
            } else if (quarter_string.includes("0")) {
              children = this.setCmdForNode(children[0], this.quarterCommands, quarterCommandsList[3]);
            }

            children = this.setCmdForNode(product.right, this.commandsStartRight, this.findIndex(dax30Stocks, methods[2]))
            // next one is set automatically, so we have to get the child's childs.
            let node = this.cy.getElementById(children[0]);
            children = node.data('children') || [];
            // set which emotion it is
            children = this.setCmdForNode(children[0], this.emotionsCommandsRight, this.findIndex(emotionsCommandsList, methods[4]));
            quarter_string = methods[6];
            if (quarter_string.includes("1")) {
              children = this.setCmdForNode(children[0], this.quarterCommandsRight, quarterCommandsList[0]);
            } else if (quarter_string.includes("2")) {
              children = this.setCmdForNode(children[0], this.quarterCommandsRight, quarterCommandsList[1]);
            } else if (quarter_string.includes("3")) {
              children = this.setCmdForNode(children[0], this.quarterCommandsRight, quarterCommandsList[2]);
            } else if (quarter_string.includes("0")) {
              children = this.setCmdForNode(children[0], this.quarterCommandsRight, quarterCommandsList[3]);
            }
            break;




          case "quarter":
            children = this.setCmdForNode(children[0], this.commands2, seclvlcommands[1]);
            if (methods[3].includes("yoy")) {
              children = this.setCmdForNode(children[0], this.businessCommands, businessCommandsList[1])
            } else if (methods[3].includes("beat")) {
              children = this.setCmdForNode(children[0], this.businessCommands, businessCommandsList[2])
            } else if (methods[3].includes("revenue")) {
              children = this.setCmdForNode(children[0], this.businessCommands, businessCommandsList[0])
            }
            if (methods[5].includes("1")) {
              children = this.setCmdForNode(children[0], this.quarterCommands, quarterCommandsList[0]);
            } else if (methods[5].includes("2")) {
              children = this.setCmdForNode(children[0], this.quarterCommands, quarterCommandsList[1]);
            } else if (methods[5].includes("3")) {
              children = this.setCmdForNode(children[0], this.quarterCommands, quarterCommandsList[2]);
            } else if (methods[5].includes("0")) {
              children = this.setCmdForNode(children[0], this.quarterCommands, quarterCommandsList[3]);
            }

            children = this.setCmdForNode(product.right, this.commandsStartRight, this.findIndex(dax30Stocks, methods[2]))
            let index = 4;
            if (methods[0].includes("sim")) {
              index = 3;
            }
            // next one is set automatically, so we have to get the child's childs.
            children = this.cy.getElementById(children[0]).data('children') || [];
            if (methods[index].includes("yoy")) {
              children = this.setCmdForNode(children[0], this.businessCommandsRight, businessCommandsList[1])
            } else if (methods[index].includes("beat")) {
              children = this.setCmdForNode(children[0], this.businessCommandsRight, businessCommandsList[2])
            } else if (methods[index].includes("revenue")) {
              children = this.setCmdForNode(children[0], this.businessCommandsRight, businessCommandsList[0])
            }
            if (methods[6].includes("1")) {
              children = this.setCmdForNode(children[0], this.quarterCommandsRight, quarterCommandsList[0]);
            } else if (methods[6].includes("2")) {
              children = this.setCmdForNode(children[0], this.quarterCommandsRight, quarterCommandsList[1]);
            } else if (methods[6].includes("3")) {
              children = this.setCmdForNode(children[0], this.quarterCommandsRight, quarterCommandsList[2]);
            } else if (methods[6].includes("0")) {
              children = this.setCmdForNode(children[0], this.quarterCommandsRight, quarterCommandsList[3]);
            }
            break;

          case "year":
            children = this.setCmdForNode(children[0], this.commands2, seclvlcommands[2]);
            if (methods[3].includes("liabilities")) {
              children = this.setCmdForNode(children[0], this.businessYearlyCommands, businessCommandsYearlyList[0])
            } else if (methods[3].includes("cash")) {
              children = this.setCmdForNode(children[0], this.businessYearlyCommands, businessCommandsYearlyList[1])
            } else if (methods[3].includes("book")) {
              children = this.setCmdForNode(children[0], this.businessYearlyCommands, businessCommandsYearlyList[2])
            } else if (methods[3].includes("debt")) {
              children = this.setCmdForNode(children[0], this.businessYearlyCommands, businessCommandsYearlyList[3])
            } else if (methods[3].includes("ebit")) {
              children = this.setCmdForNode(children[0], this.businessYearlyCommands, businessCommandsYearlyList[4])
            } else if (methods[3].includes("employees")) {
              children = this.setCmdForNode(children[0], this.businessYearlyCommands, businessCommandsYearlyList[5])
            }
            if (methods[5].includes("1")) {
              children = this.setCmdForNode(children[0], this.yearCommands, yearCommandsList[0]);
            } else if (methods[5].includes("2")) {
              children = this.setCmdForNode(children[0], this.yearCommands, yearCommandsList[1]);
            } else if (methods[5].includes("3")) {
              children = this.setCmdForNode(children[0], this.yearCommands, yearCommandsList[2]);
            } else if (methods[5].includes("0")) {
              children = this.setCmdForNode(children[0], this.yearCommands, yearCommandsList[3]);
            }

            children = this.setCmdForNode(product.right, this.commandsStartRight, this.findIndex(dax30Stocks, methods[2]))
            let index_year = 4;
            if (methods[0].includes("sim")) {
              index_year = 3;
            }
            // next one is set automatically, so we have to get the child's childs.
            children = this.cy.getElementById(children[0]).data('children') || [];
            if (methods[index_year].includes("liabilities")) {
              children = this.setCmdForNode(children[0], this.businessYearlyCommandsRight, businessCommandsYearlyList[0])
            } else if (methods[index_year].includes("cash")) {
              children = this.setCmdForNode(children[0], this.businessYearlyCommandsRight, businessCommandsYearlyList[1])
            } else if (methods[index_year].includes("book")) {
              children = this.setCmdForNode(children[0], this.businessYearlyCommandsRight, businessCommandsYearlyList[2])
            } else if (methods[index_year].includes("debt")) {
              children = this.setCmdForNode(children[0], this.businessYearlyCommandsRight, businessCommandsYearlyList[3])
            } else if (methods[index_year].includes("ebit")) {
              children = this.setCmdForNode(children[0], this.businessYearlyCommandsRight, businessCommandsYearlyList[4])
            } else if (methods[index_year].includes("employees")) {
              children = this.setCmdForNode(children[0], this.businessYearlyCommandsRight, businessCommandsYearlyList[5])
            }
            if (methods[6].includes("1")) {
              children = this.setCmdForNode(children[0], this.yearCommandsRight, yearCommandsList[0]);
            } else if (methods[6].includes("2")) {
              children = this.setCmdForNode(children[0], this.yearCommandsRight, yearCommandsList[1]);
            } else if (methods[6].includes("3")) {
              children = this.setCmdForNode(children[0], this.yearCommandsRight, yearCommandsList[2]);
            } else if (methods[6].includes("0")) {
              children = this.setCmdForNode(children[0], this.yearCommandsRight, yearCommandsList[3]);
            }
            method = "year";
            break;





          case "price":
            //console.log("OKOKOKOKOKOK")
            children = this.setCmdForNode(children[0], this.commands2, seclvlcommands[0]);
            if (methods[3].includes("open")) {
              children = this.setCmdForNode(children[0], this.priceCommands, priceCommandsList[0])
            } else if (methods[3].includes("high")) {
              children = this.setCmdForNode(children[0], this.priceCommands, priceCommandsList[1])
            } else if (methods[3].includes("low")) {
              children = this.setCmdForNode(children[0], this.priceCommands, priceCommandsList[2])
            } else if (methods[3].includes("close")) {
              children = this.setCmdForNode(children[0], this.priceCommands, priceCommandsList[3])
            } else if (methods[3].includes("volume")) {
              children = this.setCmdForNode(children[0], this.priceCommands, priceCommandsList[4])
            }
            let alreadySet = 2;
            if (methods[0].split('_')[0].includes("average")) {
              children = this.setCmdForNode(children[0], this.metaPriceCommands, metaPriceCommandsList[1])
              let match = methods[5].match(/\d+/);
              let number = match ? parseInt(match[0]) : null;
              // Step 2: Find the index in the array
              let index = 0; // Default index
              if (number !== null) {
                const foundIndex = numbersDaysCommandsList.findIndex(element => element === number);
                if (foundIndex !== -1) {
                  index = foundIndex;
                }
              }
              this.setCmdForNode(children[0], this.numbersCommand, numbersDaysCommandsList[index]);
              match = methods[6].match(/\d+/);
              number = match ? parseInt(match[0]) : null;
              // Step 2: Find the index in the array
              index = 0; // Default index
              if (number !== null) {
                const foundIndex = numbersDaysCommandsList.findIndex(element => element === number);
                if (foundIndex !== -1) {
                  index = foundIndex;
                }
              }
              this.setCmdForNode(children[1], this.numbersCommand, numbersDaysCommandsList[index]);
            } else if (methods[0].split('_')[0].includes("delta")) {
              children = this.setCmdForNode(children[0], this.metaPriceCommands, metaPriceCommandsList[0])
              let match = methods[5].match(/\d+/);
              let number = match ? parseInt(match[0]) : null;
              // Step 2: Find the index in the array
              let index = 0; // Default index
              if (number !== null) {
                const foundIndex = numbersDaysCommandsList.findIndex(element => element === number);
                if (foundIndex !== -1) {
                  index = foundIndex;
                }
              }
              this.setCmdForNode(children[0], this.numbersCommand, numbersDaysCommandsList[index]);
              match = methods[6].match(/\d+/);
              number = match ? parseInt(match[0]) : null;
              // Step 2: Find the index in the array
              index = 0; // Default index
              if (number !== null) {
                const foundIndex = numbersDaysCommandsList.findIndex(element => element === number);
                if (foundIndex !== -1) {
                  index = foundIndex;
                }
              }
              this.setCmdForNode(children[1], this.numbersCommand, numbersDaysCommandsList[index]);
            } else if (methods[0].split('_')[0].includes("value")) {
              children = this.setCmdForNode(children[0], this.metaPriceCommands, metaPriceCommandsList[2])

              let match = methods[5].match(/\d+/);
              let number = match ? parseInt(match[0]) : null;
              // Step 2: Find the index in the array
              let index = 0; // Default index
              if (number !== null) {
                const foundIndex = numbersDaysCommandsList.findIndex(element => element === number);
                if (foundIndex !== -1) {
                  index = foundIndex;
                }
              }
              this.setCmdForNode(children[0], this.numbersCommand, numbersDaysCommandsList[index]);
              alreadySet = 1;
            }

            //console.log("LÖINKS WRENFITZG");
            children = this.setCmdForNode(product.right, this.commandsStartRight, this.findIndex(dax30Stocks, methods[2]))
            // next one automatic, find childrens child
            children = this.cy.getElementById(children[0]).data('children') || [];
            if (methods[4].includes("open")) {
              children = this.setCmdForNode(children[0], this.priceCommandsRight, priceCommandsList[0])
            } else if (methods[4].includes("high")) {
              children = this.setCmdForNode(children[0], this.priceCommandsRight, priceCommandsList[1])
            } else if (methods[4].includes("low")) {
              children = this.setCmdForNode(children[0], this.priceCommandsRight, priceCommandsList[2])
            } else if (methods[4].includes("close")) {
              children = this.setCmdForNode(children[0], this.priceCommandsRight, priceCommandsList[3])
            } else if (methods[4].includes("volume")) {
              children = this.setCmdForNode(children[0], this.priceCommandsRight, priceCommandsList[4])
            }

            // include the child's childs and set them
            if (methods[0].split('_')[0].includes("delta")) {
              children = this.cy.getElementById(children[0]).data('children') || [];
              let match = methods[7].match(/\d+/);
              let number = match ? parseInt(match[0]) : null;
              // Step 2: Find the index in the array
              let index = 0; // Default index
              if (number !== null) {
                const foundIndex = numbersDaysCommandsList.findIndex(element => element === number);
                if (foundIndex !== -1) {
                  index = foundIndex;
                }
              }
              this.setCmdForNode(children[0], this.numbersCommandRight, numbersDaysCommandsList[index]);
              match = methods[8].match(/\d+/);
              number = match ? parseInt(match[0]) : null;
              // Step 2: Find the index in the array
              index = 0; // Default index
              if (number !== null) {
                const foundIndex = numbersDaysCommandsList.findIndex(element => element === number);
                if (foundIndex !== -1) {
                  index = foundIndex;
                }
              }
              this.setCmdForNode(children[1], this.numbersCommandRight, numbersDaysCommandsList[index]);
            } else {

              if (methods[0].split('_')[1].includes("average")) {
                children = this.setCmdForNode(children[0], this.metaPriceCommandsRight, metaPriceCommandsListRight[0])
                let match = methods[5 + alreadySet].match(/\d+/);
              let number = match ? parseInt(match[0]) : null;
              // Step 2: Find the index in the array
              let index = 0; // Default index
              if (number !== null) {
                const foundIndex = numbersDaysCommandsList.findIndex(element => element === number);
                if (foundIndex !== -1) {
                  index = foundIndex;
                }
              }
              this.setCmdForNode(children[0], this.numbersCommandRight, numbersDaysCommandsList[index]);
              match = methods[5 + alreadySet + 1].match(/\d+/);
              number = match ? parseInt(match[0]) : null;
              // Step 2: Find the index in the array
              index = 0; // Default index
              if (number !== null) {
                const foundIndex = numbersDaysCommandsList.findIndex(element => element === number);
                if (foundIndex !== -1) {
                  index = foundIndex;
                }
              }
              this.setCmdForNode(children[1], this.numbersCommandRight, numbersDaysCommandsList[index]);
              } else if (methods[0].split('_')[1].includes("value")) {
                //console.log("soweit sogut")
                children = this.setCmdForNode(children[0], this.metaPriceCommandsRight, metaPriceCommandsListRight[1]);
                let match = methods[5 + alreadySet].match(/\d+/);
              let number = match ? parseInt(match[0]) : null;
              // Step 2: Find the index in the array
              let index = 0; // Default index
              if (number !== null) {
                const foundIndex = numbersDaysCommandsList.findIndex(element => element === number);
                if (foundIndex !== -1) {
                  index = foundIndex;
                }
              }
              this.setCmdForNode(children[0], this.numbersCommandRight, numbersDaysCommandsList[index]);
              }
            }
            method = "price";
            break;
      }

      if (methods[methods.length - 1].includes(">") || methods[methods.length - 1].includes("le")) {
      this.setCmdForNode(product.bottom, this.compareCommands, ">")
      } else {
        this.setCmdForNode(product.bottom, this.compareCommands, "<")
      }

      //console.log(method);
      this.showMore = false;



      index_counter = index_counter + 1;

  }
  this.checkStrategy();

  if (this.amount_features >= 4) {
    this.maxLinchpins = true;
  } else {
    this.maxLinchpins = false;
  }



  }


  async updateTopString() {
    try {
      const response = await this.getStringFromBackendAsync(this.url);
      this.topString = response;
      // Perform further actions with the received string
    } catch (error) {
      // Handle errors here
    }
  }

  async updateNodeString(feature: string[], node_id: string) {
    //try {

      //console.log("okokok");
      //console.log(feature);
      if (feature[0] == "Deutsche Bank") {
        feature[0] = "deutschebank"
      }

      const featureString = feature.join(',');


      let queryString = `features=${encodeURIComponent(featureString)}`;


      if (this.currentDate) {
        // Clone the current date
        let nextDay = new Date(this.currentDate);

        // Add one day
        nextDay.setDate(nextDay.getDate() + 1);

        // Format the date as 'YYYY-MM-DD'
        const formattedDate = nextDay.toISOString().split('T')[0];

        // Append to query string
        queryString += `&date=${encodeURIComponent(formattedDate)}`;
    } else {
        // Handle the case when currentDate is null
        // For example, you can use a default date, or skip adding the date to the query
    }


      //console.log(queryString)

      let response = "nana"
      response = await this.getStringFromBackendAsync(this.url + `node/feature?${queryString}`);

      //let dates = [
      //  new Date(2020, 0, 16),
      //  new Date(2020, 0, 12)];
    //this.updateSpecialDates(dates);

      let element = this.cy.$('#' + node_id);
      //console.log("was sagt des backend");

      const jsonResponse = JSON.parse(response);
      const result = jsonResponse.result;
      //console.log(result);
      try {
      this.products[element.data('index')].orientation_string = result
      element.data('label', result);
      // Perform further actions with the received string
    } catch (error) {
      //console.log("WAS DA LOS")
      // Handle errors here
    }
  }


  private createProductQueryString(products: Product[]): string {
    return products.map((product, productIndex) => {
      const leftFeatures = product.left_features.map((feature, index) => `left_features${productIndex}_${index}=${encodeURIComponent(feature)}`).join('&');
      const rightFeatures = product.right_features.map((feature, index) => `right_features${productIndex}_${index}=${encodeURIComponent(feature)}`).join('&');
      const comparison = product.comparison.map((comp, index) => `comparison${productIndex}_${index}=${encodeURIComponent(comp)}`).join('&');

      return `${leftFeatures}&${rightFeatures}&${comparison}`;
  }).join('&');
}

async getPerformance() {
  this.showInfoIcon = false;
  this.showInfo = false;

  let valid = this.products.every(p => p.isComplete());
  if (!valid) {
    this.isValid = false;

    setTimeout(() => {
      this.isValid = true; // Hide the message after 3 seconds
    }, 3000); // 3000 milliseconds = 3 seconds

  } else {

  this.isLoading = true;

  //await new Promise(resolve => setTimeout(resolve, 3000));

  //console.log("START HANDLING")
  //console.log("STOP HANDLING")

  await this.checkStrategy();
  await this.getNextBest();

  this.isLoading = false;
  }

}


  async checkStrategy() {

    let valid = this.products.every(p => p.isComplete());
    if (valid) {
      //console.log("wer")
      const featuresStringArray: string[] = this.products.map(product =>
        JSON.stringify({
            left_features: product.left_features,
            right_features: product.right_features,
            comparison: product.comparison,
        })
    );


      //let queryString = this.createProductQueryString(this.products);
      ////console.log(queryString)
      const url = this.url + `performance/default?products=${featuresStringArray}&action=${this.selectedAction}&stock=${this.selectedStock}`;

      let response = await this.getStringFromBackendAsync(url);

      const jsonResponse = JSON.parse(response);
      const dateStrings = jsonResponse.day_list;
      const money = jsonResponse.money;
      this.current_money = money;

      this.topString = 'Started with: 10,000. Ended with: ' + money.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + '.';
      const dates = dateStrings.map((ds: string) => {
        const year = parseInt(ds.substring(0, 4));
        const month = parseInt(ds.substring(4, 6)) - 1; // Subtract 1 because months are 0-indexed in JavaScript's Date
        const day = parseInt(ds.substring(6, 8));
        return new Date(year, month, day);
    });
    this.updateSpecialDates(dates);
    this.showInfoIcon = false;
    this.showInfo = false;
  } else {
    this.topString = 'Started with: 10,000. Ended with: 10,000.';
  }
  }


  async getNextBest() {

    this.showInfoIcon = false;
    const featuresStringArray: string[] = this.products.map(product =>
      JSON.stringify({
          left_features: product.left_features,
          right_features: product.right_features,
          comparison: product.comparison,
      })
  );
  //console.log("i frag amal as backend nachm nächstbesten!!")
    const url = this.url + `performance/best?products=${featuresStringArray}&action=${this.selectedAction}&stock=${this.selectedStock}`;
    let response = await this.getStringFromBackendAsync(url);

      //console.log(response);
      const jsonResponse = JSON.parse(response);

      this.winnerString = "Based on the data, we found a signal performing better, making " + jsonResponse.money.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + " from 10,000.";

      if (jsonResponse.money > this.current_money + 100 ) {
        this.try_it_shown = true;
        this.showInfoIcon = true;
        this.aiSignal = jsonResponse.next_best;
      } else {
        this.try_it_shown = false;
        this.winnerString = "No improvement found."

      this.showInfoIcon = true;

      }

  }



  @ViewChild('cy') cyElement!: ElementRef;
  cy: any;  // Explicitly typing the 'cy' property

  current_x: any;
  amount_features: any;

  message = 'Triangle nodes added!';


  products: Product[] = [];

  appendIdToDaddies(childNodeId: string, new_id: string): void {
    // Retrieve the child node
    let childNode = this.cy.getElementById(childNodeId);

    // Get the list of daddies' IDs from the child node's data
    let daddiesIds = childNode.data('daddies');
    if (!daddiesIds) {
      return; // No daddies to update
    }

    // Iterate over each daddy ID and update their children data
    daddiesIds.forEach((daddyId: string) => {
      let daddyNode = this.cy.getElementById(daddyId);
      if (daddyNode) {
        let daddyChildren = daddyNode.data('children') || [];
        if (!daddyChildren.includes(new_id)) {
          daddyChildren.push(new_id); // Append the child node ID
          daddyNode.data('children', daddyChildren); // Update the daddy node's data
        }
      }
    });
  }

  removeChildNodes(parentNodeId: string): void {
    // Retrieve the parent node
    let parentNode = this.cy.getElementById(parentNodeId);

    // Get the list of children IDs from the parent node's data
    let childrenIds = parentNode.data('children');
    if (!childrenIds) {
      return; // No children to remove
    }

    // Iterate over each child ID and remove the corresponding node
    childrenIds.forEach((childId: string) => {
      let childNode = this.cy.getElementById(childId);
      if (childNode) {
        childNode.remove(); // Remove the child node
      }
    });

    // Optionally, clear the children data from the parent node
    parentNode.data('children', []);
  }



  addTriangleNodes() {
    //const cy = ... // your existing Cytoscape instance

    //const width = this.cy.container().clientWidth;
    //const height = this.cy.container().clientHeight;

    // Triangle vertices positions
    const top1 = { x: this.current_x + 200, y: 100};
    const top2 = { x: this.current_x + 400, y: 100 };
    const bottom = { x: this.current_x + 300, y: 200 };
    this.current_x = this.current_x + 400

    const id1 = 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const id2 = 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const id3 = 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const id4 = 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const id5 = 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);


    this.cy.add([
      { group: 'nodes', data: { id: id1, label: "", active: "true", index: this.amount_features, associated_2: id2, associated_3: id3, stock: "none", price: "none", feature: "none" , left: "yes"}, position: top1 },
      { group: 'nodes', data: { id: id2, label: "", active: "false", index: this.amount_features, associated_1: id1, associated_3: id3, stock: "none", feature: "none" , set_allowed: "true"}, position: top2 },
      { group: 'nodes', data: { id: id3, associated_1: id1, associated_2: id2, index: this.amount_features }, position: bottom },
      { group: 'edges', data: { id: id4, source: id1, target: id3 } },
      { group: 'edges', data: { id: id5, source: id2, target: id3 } },
    ]);

    this.cy.fit(); // Adjust viewport to fit new nodes
    this.cy.panBy({ x: 0, y: 100 });

    this.products.push(new Product(id1, id2, id3));
    this.amount_features = this.amount_features + 1;

    if (this.amount_features >= 4) {
      this.maxLinchpins = true;
    }
}

addFeatureNodeBelow(daddy_id: string, nodePosX: number, nodePosY: number, offsetX: number, offsetY: number, size: number, text: string, commands: any, index: number, lastPos: string = "No"): string {

  let id = 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  // position of new text field
  let newPosition = {
      x: nodePosX + offsetX,
      y: nodePosY + offsetY
  };


  this.cy.add({
    group: 'nodes',
    data: {id: id, active: "true", 'label': text, index: index, children: [], daddies: [daddy_id], lastPos: lastPos},
    position: newPosition,
    style: {
        'width': size,
        'height': size,
        'label': 'data(label)',
        'text-halign': 'center',
        'text-valign': 'center',
        'font-size': 10,
        'text-wrap': 'wrap', // Ermöglicht das Umbruchverhalten
        'text-max-width': '60',
        //'background-color': '#666',
    }
  });
  //console.log("jawoll no einer")
  //console.log(lastPos)

  // select stock
  this.cy.cxtmenu({
    fillColor: 'rgba(0, 0, 0, 0.92)',
    openMenuEvents: 'cxttapstart mousedown',
    //openMenuEvents: 'tap',
    selector: 'node[id="' + id + '"]',
    commands: commands,
  });

  return id;

}


addFeatureNodeBelowNoCxt(daddy_id: string, nodePosX: number, nodePosY: number, offsetX: number, offsetY: number, size: number, text: string, commands: any, index: number, lastPos: string = "No"): string {

  let id = 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  // position of new text field
  let newPosition = {
      x: nodePosX + offsetX,
      y: nodePosY + offsetY
  };


  this.cy.add({
    group: 'nodes',
    data: {id: id, active: "true", 'label': text, index: index, children: [], daddies: [daddy_id], lastPos: lastPos},
    position: newPosition,
    style: {
        'width': size,
        'height': size,
        'label': 'data(label)',
        'text-halign': 'center',
        'text-valign': 'center',
        'font-size': 10,
        'text-wrap': 'wrap', // Ermöglicht das Umbruchverhalten
        'text-max-width': '60',
        //'background-color': '#666',
    }
  });
  //console.log("jawoll no einer")
  //console.log(lastPos)

  return id;

}



addInfoNodeBelow(daddy_id: string, nodePosX: number, nodePosY: number, offsetX: number, offsetY: number, size: number, text: string, index: number, features: string[], lastPos: string = "No"): string {

  let id = 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  // position of new text field
  let newPosition = {
      x: nodePosX + offsetX,
      y: nodePosY + offsetY
  };
  this.cy.add({
    group: 'nodes',
    data: {id: id, 'label': text, index: index, children: [], daddies: [daddy_id], last: lastPos},
    position: newPosition,
    style: {
        'width': 1,
        'height': 1,
        'label': 'data(label)',
        'text-halign': 'center',
        'text-valign': 'center',
        'font-size': 12,
        'background-opacity': 0,
        'text-opacity': 1,
        'color': '#50bda5',
        'text-color': '#50bda5'
    }
  });


  this.products[index].node_info_ids.push(id);
  //console.log("PUSHED NEW ID")
  //console.log(id)
  this.products[index].node_info_features.push(features);


  return id;
}


setCmdForNode(node_id: string, cxtCommand: any, commandString: any) {
  let node = this.cy.getElementById(node_id);
          let rightCommand = cxtCommand.find( (command: any) => command.content === commandString);
          if (rightCommand && rightCommand.select) {
            rightCommand.select(node);
        }

  let children = node.data('children') || [];
  return children
}



adjustCytoscapeHeight() {
  if (this.cyElement && this.cyElement.nativeElement) {
    this.cyElement.nativeElement.style.height = `${window.innerHeight-2}px`;



  }
}

// all commands
commandsStart: any;
commands2: any;
priceCommands: any;
metaPriceCommands: any;
numbersCommand: any;
businessCommands: any;
businessYearlyCommands: any;
emotionsCommands: any;
quarterCommands: any;
yearCommands: any;
commandsStartRight: any;
commands2right: any;
priceCommandsRight: any;
metaPriceCommandsRight: any;
numbersCommandRight: any;
businessCommandsRight: any;
businessYearlyCommandsRight: any;
emotionsCommandsRight: any;
quarterCommandsRight: any;
yearCommandsRight: any;
compareCommands: any;
metaPriceCommandsRightDelta: any;


setup_cyto() {
  this.adjustCytoscapeHeight();
    window.addEventListener('resize', () => this.adjustCytoscapeHeight());



    const top1 = { x: 100, y: 100 };
    const top2 = { x: 300, y: 100 };
    const bottom = { x: 200, y: 200 };
    this.current_x = 300;

    let id1 = 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    let id2 = 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    let id3 = 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    this.cy = cytoscape({
      container: this.cyElement.nativeElement,
      elements: [


        { group: 'nodes', data: { id: id1, label: "Select Company", active: "true", index: 0, associated_2: id2, associated_3: id3 , stock: "none", price: "none", feature: "none", children: [], daddies: [], left: "yes", subLabel: 'Sub Label' }, position: top1 },
      { group: 'nodes', data: { id: id2, label: "", active: "false", index: 0, associated_1: id1, associated_3: id3, stock: "none", feature: "none" , set_allowed: "false"}, position: top2 },

      { group: 'nodes', data: { id: id3, associated_1: id1, associated_2: id2, index: 0 }, position: bottom },
      { group: 'edges', data: { id: 'e1', source: id1, target: id3 } },
      { group: 'edges', data: { id: 'e2', source: id2, target: id3 } },
        //{ data: { id: 'c' } },
        //{ data: { id: 'ab', source: 'a', target: 'b'} },
        //{ data: { id: 'bc', source: 'b', target: 'c'} }
      ],
      style: [
        {
          selector: 'node',
          style: {
            'overlay-opacity': 0,
            'width': 50,
            'height': 50,
            'label': 'data(label)',
            'text-halign': 'center',
            'text-valign': 'center',
            'background-color': '#666',
            'text-outline-color': '#fff',
            'text-outline-width': 0.5 ,
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
          },
        },
        {
          selector: 'node[active="true"]',
          style: {
            //'label': 'data(label)',
            //'background-color': '#00ff00',
            'background-color': '#50bda5',
            'text-wrap': 'wrap', // Ermöglicht das Umbruchverhalten
            'text-max-width': '80',
          },
        },
      ],
      layout: {
        //name: 'grid',
        //rows: 1,
        name: 'preset'
      },
      wheelSensitivity: 0.3, // Adjust this value to control zoom speed

  minZoom: 1.2, // Set maximum zoom out level
  maxZoom: 5.5,
  zoom: 1.9, // Set initial zoom level
    });

  this.products.push(new Product(id1, id2, id3));
  this.amount_features = 1;
  //console.log("WIE OFT NOCH ALTER MANN");
  //console.log(id1)




  this.cy.fit(); // Adjust viewport to fit new nodes
  //this.cy.zoom(1.4);

    // Get the current zoom level after fitting
let currentZoom = this.cy.zoom();

// Set a new zoom level, slightly smaller than the current to zoom out
// Adjust the factor (e.g., 0.9) to control how much you zoom out
let zoomOutFactor = 0.5;
this.cy.zoom(currentZoom * zoomOutFactor);

let nodeId = 'yourNodeId'; // Replace 'yourNodeId' with the actual ID of the node
this.cy.center(this.cy.getElementById(id3));
this.cy.panBy({ x: 0, y: 200 });






this.cy.on('add', 'node', (event: EventObject) => {
  event.target.ungrabify();
});
this.cy.nodes().forEach((node: NodeSingular) => {
  node.ungrabify();
});
if (this.commandsStart) {
  this.cy.cxtmenu({
    fillColor: 'rgba(0, 0, 0, 0.92)', // example option
    //fillColor: 'rgba(355, 0, 0, 0.92)',
    openMenuEvents: 'cxttapstart mousedown',
    //selector: 'node[id="' + id1 + '"]',
    selector: 'node[left="yes"]', //stock: "none"
    commands: this.commandsStart,
  });
}

  this.cy.on('tap', () => {
    this.showMore = false; // Set showMore to false when the graph is clicked
  });
  this.cy.on('pan', () => {
    this.showMore = false; // Set showMore to false when the graph is clicked
  });
  this.cy.on('zoom', () => {
    this.showMore = false; // Set showMore to false when the graph is clicked
  });
  this.cy.on('click', () => {
    this.showMore = false; // Set showMore to false when the graph is clicked
  });
  this.cy.on('cxttapstart', () => {
    this.showMore = false; // Set showMore to false when the graph is clicked
  });
  this.cy.on('mousedown', () => {
    this.showMore = false; // Set showMore to false when the graph is clicked
  });


}


  ngAfterViewInit() {
    this.backendTest();


   this.commandsStart = dax30Stocks.map((stock) => {
    return {
      content: stock,
      select: (ele : any) => {
        let element = this.cy.$('#' + ele.id());
        let position = element.position();
        //console.log(stock, 'selected for', ele.id());
        //console.log(ele.lvl);
        let new_id = this.addFeatureNodeBelow(ele.id(), position.x, position.y, 0, 40, 45, "Select Feature", this.commands2, element.data('index'));
        element.data('label', stock);

        // update products
        //console.log("DER INDEX")
        //console.log(element.data('index'))
        let index = element.data('index');
        this.removeChildNodes(this.products[index].right)
        this.products[index].updateLeftFeature(0, stock);

        this.removeChildNodes(ele.id());
        let right = this.cy.$('#' + this.products[index].right);
        right.data('set_allowed', "false")
        right.data('active', "false")
        right.data('label', "")



       // this.cy.getElementById(ele.id()).data('active', false);
        element.data('active', false);

        let children = element.data('children') || [];
        children.push(new_id);
        element.data('children', children);

        let new_element = this.cy.$('#' + new_id);
        let new_daddies = element.data('daddies') || [];
        new_daddies.push(ele.id());
        new_element.data('daddies', new_daddies);

        //this.cy.$('#nodeId').removeClass('lvl1').addClass('lvl2');

      },
    };
  });

  this.setup_cyto();

  // NACH AKTIEN
  this.commands2 = seclvlcommands.map((command) => {
    return {
      content: command,
      select: (ele : any) => {
        let element = this.cy.$('#' + ele.id());
        let position = element.position();
        let new_id = "wer"
        let index = element.data('index');
        this.removeChildNodes(this.products[index].right)

        this.removeChildNodes(ele.id());
        let right = this.cy.$('#' + this.products[index].right);
        right.data('set_allowed', "false")
        right.data('active', "false")
        right.data('label', "")


        if (command == "Cancel") {
          //console.log("ok servus");
          //element.data('lvl', '1');
          element.data('label', 'Select Company');
        }  else if (command == "Stock Price") {
          //console.log(command, 'selected for', ele.id());
          element.data('label', 'Price');

          new_id = this.addFeatureNodeBelow(ele.id(), position.x, position.y, 0, 35, 40, "Select Trading Metric", this.priceCommands, element.data('index'));

          this.products[index].updateLeftFeature(1, "Price");
          this.products[index].quarter_year_command = "";

        } else if (command == "Quarterly Metrics") {
          //console.log(command, 'selected for', ele.id());
          element.data('label', 'Quarterly Metrics');
          new_id = this.addFeatureNodeBelow(ele.id(), position.x, position.y, 0, 35, 40, "Select Business Metric", this.businessCommands, element.data('index'));

          this.products[index].updateLeftFeature(1, "QuarterMetrics");

        } else if (command == "Yearly Metrics") {
          //console.log(command, 'selected for', ele.id());
          element.data('label', 'Yearly Metrics');
          new_id = this.addFeatureNodeBelow(ele.id(), position.x, position.y, 0, 35, 40, "Select Business Metric", this.businessYearlyCommands, element.data('index'));

          this.products[index].updateLeftFeature(1, "YearMetrics");

        } else if (command == "Earnings Talk Emotions") {
          //console.log(command, 'selected for', ele.id());
          element.data('label', 'Emotions');
          new_id = this.addFeatureNodeBelow(ele.id(), position.x, position.y, 0, 35, 40, "Select Emotion", this.emotionsCommands, element.data('index'));

          this.products[index].updateLeftFeature(1, "Emotions");
          this.products[index].quarter_year_command = "";
        }
        //immer
        let children = element.data('children') || [];
        children.push(new_id);
        element.data('children', children);
        this.appendIdToDaddies(ele.id(), new_id);
        let new_element = this.cy.$('#' + new_id);
        let new_daddies = element.data('daddies') || [];
        new_daddies.push(ele.id());
        new_element.data('daddies', new_daddies);
        element.data('active', false);

        this.products[index].price_command = "";
      },
    };
  });


  // NACH PRICE
  this.priceCommands = priceCommandsList.map((command) => {
    return {
      content: command,
      select: (ele : any) => {
        let element = this.cy.$('#' + ele.id());
        let position = element.position();
        let new_id = "wer"
        let index = element.data('index');
        this.removeChildNodes(this.products[index].right)

        this.removeChildNodes(ele.id());
        let right = this.cy.$('#' + this.products[index].right);
        right.data('set_allowed', "false")
        right.data('active', "false")
        right.data('label', "")

        if (command == "Cancel") {
          //console.log("ok servus");
          //this.cy.$('#' + ele.id()).data('lvl', '1');
        } else {
          //console.log(command, 'selected for', ele.id());
          element.data('label', command);
          new_id = this.addFeatureNodeBelow(ele.id(), position.x, position.y, 0, 30, 35, "Select Calculation", this.metaPriceCommands, element.data('index'));
          this.products[index].updateLeftFeature(2, command);
          //element.data('lvl', 'emotions');
          //console.log(ele.lvl);
        }


        let children = element.data('children') || [];
        children.push(new_id);
        element.data('children', children);
        this.appendIdToDaddies(ele.id(), new_id);

        let new_element = this.cy.$('#' + new_id);
        let new_daddies = element.data('daddies') || [];
        new_daddies.push(ele.id());
        new_element.data('daddies', new_daddies);

        //console.log("OKOKOKOKOKKOOK");
        //console.log(element);
        //console.log(new_element);

        element.data('active', false);


      },
    };
  });

  this.metaPriceCommands = metaPriceCommandsList.map((command) => {
    return {
      content: command,
      select: (ele : any) => {
        let element = this.cy.$('#' + ele.id());
        let position = element.position();
        let new_id = "wer"
        let index = element.data('index');
        this.removeChildNodes(this.products[index].right)

        this.removeChildNodes(ele.id());
        let right = this.cy.$('#' + this.products[index].right);
        right.data('set_allowed', "false")
        right.data('active', "false")
        right.data('label', "")

        if (command == "Cancel") {
          //console.log("ok servus");
          //this.cy.$('#' + ele.id()).data('lvl', '1');
        }  else if (command == "Delta") {
          //console.log(command, 'selected for', ele.id());
          element.data('label', command);
          let new_id1 = this.addFeatureNodeBelow(ele.id(), position.x, position.y, -18, 23, 30, "Day from", this.numbersCommand, element.data('index'), "left");
          let new_id2 = this.addFeatureNodeBelow(ele.id(), position.x, position.y, 18, 23, 30, "Day to", this.numbersCommand, element.data('index'), "right");

          let children1 = element.data('children') || [];
          children1.push(new_id1);
          element.data('children', children1);
          this.appendIdToDaddies(ele.id(), new_id1);

          let new_element1 = this.cy.$('#' + new_id1);
          let new_daddies1= element.data('daddies') || [];
          new_daddies1.push(ele.id());
          new_element1.data('daddies', new_daddies1);


          let children2 = element.data('children') || [];
          children2.push(new_id2);
          element.data('children', children2);
          this.appendIdToDaddies(ele.id(), new_id2);

          let new_element2 = this.cy.$('#' + new_id2);
          let new_daddies2 = element.data('daddies') || [];
          new_daddies2.push(ele.id());
          new_element2.data('daddies', new_daddies2);

          this.products[index].updateLeftFeature(3, command);
          this.products[index].price_command = "Delta";



          //element.data('lvl', 'business');
        } else if (command == "MovingAverage") {
          //console.log(command, 'selected for', ele.id());
          element.data('label', command);

          let new_id1 = this.addFeatureNodeBelow(ele.id(), position.x, position.y, -18, 23, 30, "Day from", this.numbersCommand, element.data('index'), "left");
          let new_id2 = this.addFeatureNodeBelow(ele.id(), position.x, position.y, 18, 23, 30, "Day to", this.numbersCommand, element.data('index'), "right");

          let children1 = element.data('children') || [];
          children1.push(new_id1);
          element.data('children', children1);
          this.appendIdToDaddies(ele.id(), new_id1);

          let new_element1 = this.cy.$('#' + new_id1);
          let new_daddies1= element.data('daddies') || [];
          new_daddies1.push(ele.id());
          new_element1.data('daddies', new_daddies1);


          let children2 = element.data('children') || [];
          children2.push(new_id2);
          element.data('children', children2);
          this.appendIdToDaddies(ele.id(), new_id2);

          let new_element2 = this.cy.$('#' + new_id2);
          let new_daddies2 = element.data('daddies') || [];
          new_daddies2.push(ele.id());
          new_element2.data('daddies', new_daddies2);

          this.products[index].updateLeftFeature(3, command);
          this.products[index].price_command = "average"



          //element.data('lvl', 'business');
        } else if (command == "Value itself") {
          //console.log(command, 'selected for', ele.id());
          element.data('label', command);
          new_id = this.addFeatureNodeBelow(ele.id(), position.x, position.y, 0, 25, 30, "Select Day from", this.numbersCommand, element.data('index'), "middle");

          let children = element.data('children') || [];
          children.push(new_id);
          element.data('children', children);
          this.appendIdToDaddies(ele.id(), new_id);

          let new_element = this.cy.$('#' + new_id);
          let new_daddies = element.data('daddies') || [];
          new_daddies.push(ele.id());
          new_element.data('daddies', new_daddies);
          //element.data('lvl', 'business');

          this.products[index].updateLeftFeature(3, command);
          this.products[index].price_command = "average"


        }

        element.data('active', false);

        // WICHTIG
        //let element_right = this.cy.$('#' + this.products[element.data('index')].right);
        //element_right.data('active', 'true');
        ////console.log(element_right.data('active'));
        ////console.log(element_right);

      },
    };
  });


  this.numbersCommand = numbersDaysCommandsList.map((command) => {
    return {
      content: command,
      select: (ele : any) => {
        // first remove all other children of this node

        this.removeChildNodes(ele.id());
        let element = this.cy.$('#' + ele.id());
        let position = element.position();
        let new_id = "wer"

        let index = element.data('index');
        this.removeChildNodes(this.products[index].right)
        let lastNode = element.data('last');

        let right = this.cy.$('#' + this.products[index].right);
        right.data('set_allowed', "false")
        right.data('active', "false")
        right.data('label', "")

        if (command == 0) {
          //console.log("ok servus");
          //this.cy.$('#' + ele.id()).data('lvl', '1');
        } else {
          //console.log(command, 'selected for', ele.id());
          element.data('label', command);
          //console.log("SERVUS BEI MIR IS KOMPLIZIERTER");
          //console.log(lastNode);
          //this.cy.$('#' + ele.id()).data('lvl', '3');
          //this.cy.$('#' + ele.id()).data('feature', command);

          //console.log(ele.lvl);

          //console.log("ja den hammer eig");
          //console.log(new_id);

          // 4 wenns links oder middle is, sonst 5
          if (element.data('lastPos') == "left" || element.data('lastPos') == "middle") {
            this.products[index].updateLeftFeature(4, String(command));
          } else {
            this.products[index].updateLeftFeature(5, String(command));
          }
        }

        // den jetzigen auf inaktiv setzen
        element.data('active', false);

        if (this.products[index].isLeftComplete()) { // if it was the last one, we calculate the whole feature

          //console.log("etz wars der letzte")
          //console.log("ETZEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEERT WARS DER LETZTE JUHU")


          let new_daddies = element.data('daddies') || [];



          //console.log("IHWEFHFWEIEWFWEFIHFWFEIJ")
          //console.log(element.data('daddies')[new_daddies.length - 1])
          let daddy_id = element.data('daddies')[new_daddies.length - 1];
          let daddy = this.cy.$('#' + daddy_id);
          //console.log(daddy)
          let childs = daddy.data('children');
          //console.log(childs)
          this.removeChildNodes(childs[0]);
          this.removeChildNodes(childs[1]);
          this.removeChildNodes(childs[3]);
          this.removeChildNodes(childs[2]);

          position = daddy.position();



          //new_id = this.addInfoNodeBelow(ele.id(), position.x, position.y, 0, 25, 30, "", element.data('index'), this.products[index].left_features);
          new_id = this.addInfoNodeBelow(daddy_id, position.x, position.y, 0, 50, 30, "", element.data('index'), this.products[index].left_features);

          this.updateNodeString(this.products[index].left_features, new_id);
          let children = element.data('children') || [];

          children.push(new_id);
          element.data('children', children);
          this.appendIdToDaddies(ele.id(), new_id);

          let new_element = this.cy.$('#' + new_id);
          //let new_daddies = element.data('daddies') || [];

          //console.log("HMMMM");
          //console.log(new_daddies[0])

          //new_daddies.push(ele.id());
          new_element.data('daddies', new_daddies);

          // den rechten auf aktiv setzen und mit befehle zuscheissen
          //console.log("WASDENN")
          //console.log(this.products[index].right)
          let right = this.cy.$('#' + this.products[index].right);
          right.data('active', "true")
          right.data('label', "Select")

          const nodeId = this.products[index].right;


        if (nodeId) {
            this.cy.cxtmenu({
                fillColor: 'rgba(0, 0, 0, 0.92)',
                openMenuEvents: 'cxttapstart mousedown',
                selector: 'node[id="' + nodeId + '"][set_allowed="true"]',
                commands: this.commandsStartRight,
            });
        } else {
            console.error('Node ID is undefined or empty');
        }
        right.data('set_allowed', "true")

        } else { // if it was not the last one, we calculate a single value for the respective day
          //new_id = this.addInfoNodeBelow(ele.id(), position.x, position.y, 0, 25, 30, "", element.data('index'), this.products[index].left_features);
          //this.updateNodeString(this.products[index].left_features, new_id);
          //let children = element.data('children') || [];
          //children.push(new_id);
          //element.data('children', children);
          //this.appendIdToDaddies(ele.id(), new_id);

          //let new_element = this.cy.$('#' + new_id);
          //let new_daddies = element.data('daddies') || [];
          //new_daddies.push(ele.id());
          //new_element.data('daddies', new_daddies);
          //console.log("one done")

        }
      },
    };
  });





  this.businessCommands = businessCommandsList.map((command) => {
    return {
      content: command,
      select: (ele : any) => {

        // label neu festlegen
        let element = this.cy.$('#' + ele.id());
        let position = element.position();
        let new_id = "wer"
        let index = element.data('index');
        this.removeChildNodes(this.products[index].right)

        // alles drunter und rechts loeschen
        this.removeChildNodes(ele.id());
        let right = this.cy.$('#' + this.products[index].right);
        right.data('set_allowed', "false")
        right.data('active', "false")
        right.data('label', "")

        // neue node anlegen, eigenes label updaten
        //console.log(command, 'selected for', ele.id());
        element.data('label', command);
        element.data('active', false);
        new_id = this.addFeatureNodeBelow(ele.id(), position.x, position.y, 0, 30, 35, "Select Quarter", this.quarterCommands, element.data('index'));
        this.products[index].updateLeftFeature(2, command);
        this.products[index].quarter_year_command = command;
        //element.data('lvl', 'emotions');
        //console.log(ele.lvl);

        // children aktualisieren
        let children = element.data('children') || [];
        children.push(new_id);
        element.data('children', children);
        this.appendIdToDaddies(ele.id(), new_id);

        // daddies aktualisieren
        let new_element = this.cy.$('#' + new_id);
        let new_daddies = element.data('daddies') || [];
        new_daddies.push(ele.id());
        new_element.data('daddies', new_daddies);

        //console.log("OKOKOKOKOKKOOK");
        //console.log(element);
        //console.log(new_element);

      },
    };
  });


  this.businessYearlyCommands = businessCommandsYearlyList.map((command) => {
    return {
      content: command,
      select: (ele : any) => {

        // label neu festlegen
        let element = this.cy.$('#' + ele.id());
        let position = element.position();
        let new_id = "wer"
        let index = element.data('index');
        this.removeChildNodes(this.products[index].right)

        // alles drunter und rechts loeschen
        this.removeChildNodes(ele.id());
        let right = this.cy.$('#' + this.products[index].right);
        right.data('set_allowed', "false")
        right.data('active', "false")
        right.data('label', "")

        // neue node anlegen, eigenes label updaten
        //console.log(command, 'selected for', ele.id());
        element.data('label', command);
        element.data('active', false);
        new_id = this.addFeatureNodeBelow(ele.id(), position.x, position.y, 0, 30, 35, "Select Year", this.yearCommands, element.data('index'));
        this.products[index].updateLeftFeature(2, command);
        this.products[index].quarter_year_command = command;
        //element.data('lvl', 'emotions');
        //console.log(ele.lvl);

        // children aktualisieren
        let children = element.data('children') || [];
        children.push(new_id);
        element.data('children', children);
        this.appendIdToDaddies(ele.id(), new_id);

        // daddies aktualisieren
        let new_element = this.cy.$('#' + new_id);
        let new_daddies = element.data('daddies') || [];
        new_daddies.push(ele.id());
        new_element.data('daddies', new_daddies);

        //console.log("OKOKOKOKOKKOOK");
        //console.log(element);
        //console.log(new_element);

      },
    };
  });

  this.emotionsCommands = emotionsCommandsList.map((command) => {
    return {
      content: command,
      select: (ele : any) => {

        // label neu festlegen
        let element = this.cy.$('#' + ele.id());
        let position = element.position();
        let new_id = "wer"
        let index = element.data('index');
        this.removeChildNodes(this.products[index].right)


        // alles drunter und rechts loeschen
        this.removeChildNodes(ele.id());
        let right = this.cy.$('#' + this.products[index].right);
        right.data('set_allowed', "false")
        right.data('active', "false")
        right.data('label', "")

        // neue node anlegen, eigenes label updaten
        //console.log(command, 'selected for', ele.id());
        element.data('label', command);
        element.data('active', false);
        new_id = this.addFeatureNodeBelow(ele.id(), position.x, position.y, 0, 30, 35, "Select Quarter", this.quarterCommands, element.data('index'));
        this.products[index].updateLeftFeature(2, command);
        //element.data('lvl', 'emotions');
        //console.log(ele.lvl);

        // children aktualisieren
        let children = element.data('children') || [];
        children.push(new_id);
        element.data('children', children);
        this.appendIdToDaddies(ele.id(), new_id);

        // daddies aktualisieren
        let new_element = this.cy.$('#' + new_id);
        let new_daddies = element.data('daddies') || [];
        new_daddies.push(ele.id());
        new_element.data('daddies', new_daddies);

        //console.log("OKOKOKOKOKKOOK");
        //console.log(element);
        //console.log(new_element);

      },
    };
  });

  this.quarterCommands = quarterCommandsList.map((command) => {
    return {
      content: command,
      select: (ele : any) => {


        // first remove all other children of this node

        this.removeChildNodes(ele.id());
        let element = this.cy.$('#' + ele.id());
        let position = element.position();
        let new_id = "wer"

        let index = element.data('index');
        this.removeChildNodes(this.products[index].right)
        let lastNode = element.data('last');


        //console.log(command, 'selected for', ele.id());
        element.data('label', command);
        //console.log("SERVUS BEI MIR IS KOMPLIZIERTER");
        //console.log(lastNode);
        //this.cy.$('#' + ele.id()).data('lvl', '3');
        //this.cy.$('#' + ele.id()).data('feature', command);

        //console.log(ele.lvl);

        //console.log("ja den hammer eig");
        //console.log(new_id);

        // map: last to 1, 2nd last 2, 3rd last 3, average 0

        let command_int = 0;
        switch (command) {
          case 'last quarter':
              command_int =  1;
              break;
          case '2nd last quarter':
              command_int =  2;
              break;
          case '3rd last quarter':
              command_int =  3;
              break;
          case 'average of last 3':
              command_int =  0;
              break;
          default:
              //console.log("invalid command")
      }

        this.products[index].updateLeftFeature(3, String(command_int));


        // den jetzigen auf inaktiv setzen
        element.data('active', false);

        //console.log("etz wars der letzte")
        //console.log("ETZEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEERT WARS DER LETZTE JUHU")

        new_id = this.addInfoNodeBelow(ele.id(), position.x, position.y, 0, 25, 30, "", element.data('index'), this.products[index].left_features);
        this.updateNodeString(this.products[index].left_features, new_id);
        let children = element.data('children') || [];
        children.push(new_id);
        element.data('children', children);
        this.appendIdToDaddies(ele.id(), new_id);

        let new_element = this.cy.$('#' + new_id);
        let new_daddies = element.data('daddies') || [];
        new_daddies.push(ele.id());
        new_element.data('daddies', new_daddies);

        // den rechten auf aktiv setzen und mit befehle zuscheissen
        //console.log("WASDENN")
        //console.log(this.products[index].right)
        let right = this.cy.$('#' + this.products[index].right);
        right.data('active', "true")
        right.data('label', "Select")
        right.data('set_allowed', "true")


        const nodeId = this.products[index].right;
        if (nodeId) {
            this.cy.cxtmenu({
                fillColor: 'rgba(0, 0, 0, 0.92)',
                openMenuEvents: 'cxttapstart mousedown',
                selector: 'node[id="' + nodeId + '"][set_allowed="true"]',
                commands: this.commandsStartRight,
            });
        } else {
            console.error('Node ID is undefined or empty');
        }

      },
    };
  });

  this.yearCommands = yearCommandsList.map((command) => {
    return {
      content: command,
      select: (ele : any) => {


        // first remove all other children of this node

        this.removeChildNodes(ele.id());
        let element = this.cy.$('#' + ele.id());
        let position = element.position();
        let new_id = "wer"

        let index = element.data('index');
        this.removeChildNodes(this.products[index].right)

        let lastNode = element.data('last');


        //console.log(command, 'selected for', ele.id());
        element.data('label', command);
        //console.log("SERVUS BEI MIR IS KOMPLIZIERTER");
        //console.log(lastNode);
        //this.cy.$('#' + ele.id()).data('lvl', '3');
        //this.cy.$('#' + ele.id()).data('feature', command);

        //console.log(ele.lvl);

        //console.log("ja den hammer eig");
        //console.log(new_id);

        // map: last to 1, 2nd last 2, 3rd last 3, average 0

        let command_int = 0;
        switch (command) {
          case 'last year':
              command_int =  1;
              break;
          case '2nd last year':
              command_int =  2;
              break;
          case '3rd last year':
              command_int =  3;
              break;
          case 'average of last 3':
              command_int =  0;
              break;
          default:
              //console.log("invalid command")
      }

        this.products[index].updateLeftFeature(3, String(command_int));


        // den jetzigen auf inaktiv setzen
        element.data('active', false);

        //console.log("etz wars der letzte")
        //console.log("ETZEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEERT WARS DER LETZTE JUHU")

        new_id = this.addInfoNodeBelow(ele.id(), position.x, position.y, 0, 25, 30, "", element.data('index'), this.products[index].left_features);
        this.updateNodeString(this.products[index].left_features, new_id);
        let children = element.data('children') || [];
        children.push(new_id);
        element.data('children', children);
        this.appendIdToDaddies(ele.id(), new_id);

        let new_element = this.cy.$('#' + new_id);
        let new_daddies = element.data('daddies') || [];
        new_daddies.push(ele.id());
        new_element.data('daddies', new_daddies);

        // den rechten auf aktiv setzen und mit befehle zuscheissen
        //console.log("WASDENN")
        //console.log(this.products[index].right)
        let right = this.cy.$('#' + this.products[index].right);
        right.data('active', "true")
        right.data('label', "Select")
        right.data('set_allowed', "true")



        const nodeId = this.products[index].right;
        if (nodeId) {
            this.cy.cxtmenu({
                fillColor: 'rgba(0, 0, 0, 0.92)',
                openMenuEvents: 'cxttapstart mousedown',
                selector: 'node[id="' + nodeId + '"][set_allowed="true"]',
                commands: this.commandsStartRight,
            });
        } else {
            console.error('Node ID is undefined or empty');
        }




      },
    };
  });



  /**
  this.cy.cxtmenu({
    selector: 'node[lvl="1"]',
    commands: commandsStart,
  });

  // select information source
  this.cy.cxtmenu({
    selector: 'node[lvl="2"]',
    commands: commands2,
  });

  this.cy.cxtmenu({
    selector: 'node[lvl="price"]',
    commands: priceCommands,
  });
  this.cy.cxtmenu({
    selector: 'node[lvl="metaPrice"]',                                                                      AB HIER RECHTS
    commands: metaPriceCommands,
  });
  this.cy.cxtmenu({
    selector: 'node[lvl="news"]',
    commands: newsCommands,
  });
  this.cy.cxtmenu({
    selector: 'node[lvl="business"]',
    commands: businessCommands,
  });
  this.cy.cxtmenu({
    selector: 'node[lvl="emotions"]',
    commands: emotionsCommands,
  });
  */


  this.commandsStartRight = dax30Stocks.map((stock) => {
    return {
      content: stock,

      select: (ele : any) => {

        let element = this.cy.$('#' + ele.id());
        let position = element.position();
        //console.log(stock, 'selected for', ele.id());
        //console.log(ele.lvl);
        let index = element.data('index');

        let new_id = this.addFeatureNodeBelowNoCxt(ele.id(), position.x, position.y, 0, 40, 45, "Select Feature", this.commands2right, element.data('index'));

        element.data('label', stock);

        // update products
        //console.log("DER INDEX")
        this.products[index].updateRightFeature(0, stock);

        this.removeChildNodes(ele.id());



       // this.cy.getElementById(ele.id()).data('active', false);
        element.data('active', false);

        let children = element.data('children') || [];
        children.push(new_id);
        element.data('children', children);

        let new_element = this.cy.$('#' + new_id);
        let new_daddies = element.data('daddies') || [];
        new_daddies.push(ele.id());
        new_element.data('daddies', new_daddies);

        if (this.products[index].left_features[1] == "Price") {
          this.setCmdForNode(new_id, this.commands2right, seclvlcommands[0])
        } else if (this.products[index].left_features[1] == "Emotions") {
          this.setCmdForNode(new_id, this.commands2right, seclvlcommands[3])
        } else if (this.products[index].left_features[1] == "QuarterMetrics") {
          this.setCmdForNode(new_id, this.commands2right, seclvlcommands[1])
        } else if (this.products[index].left_features[1] == "YearMetrics") {
          this.setCmdForNode(new_id, this.commands2right, seclvlcommands[2])
        }

        //this.cy.$('#nodeId').removeClass('lvl1').addClass('lvl2');
      },
    };
   });



  // NACH AKTIEN
  this.commands2right = seclvlcommands.map((command) => {
    return {
      content: command,
      select: (ele : any) => {
        let element = this.cy.$('#' + ele.id());
        let position = element.position();
        let new_id = "wer"
        let index = element.data('index');

        this.removeChildNodes(ele.id());


        if (command == "Cancel") {
          //console.log("ok servus");
          //element.data('lvl', '1');
          element.data('label', 'Select Company');
        }  else if (command == "Stock Price") {

          //console.log(command, 'selected for', ele.id());
          element.data('label', 'Price');
          new_id = this.addFeatureNodeBelow(ele.id(), position.x, position.y, 0, 35, 40, "Select Price Origin", this.priceCommandsRight, element.data('index'));

          this.products[index].updateRightFeature(1, "Price");

        } else if (command == "Quarterly Metrics") {
          //console.log(command, 'selected for', ele.id());
          element.data('label', 'Quarterly Metrics');
          new_id = this.addFeatureNodeBelow(ele.id(), position.x, position.y, 0, 35, 40, "Select Business Metric", this.businessCommandsRight, element.data('index'));

          this.products[index].updateRightFeature(1, "QuarterMetrics");

        } else if (command == "Yearly Metrics") {
          //console.log(command, 'selected for', ele.id());
          element.data('label', 'Yearly Metrics');
          new_id = this.addFeatureNodeBelow(ele.id(), position.x, position.y, 0, 35, 40, "Select Business Metric", this.businessYearlyCommandsRight, element.data('index'));

          this.products[index].updateRightFeature(1, "YearMetrics");

        } else if (command == "Earnings Talk Emotions") {
          //console.log(command, 'selected for', ele.id());
          element.data('label', 'Emotions');
          new_id = this.addFeatureNodeBelow(ele.id(), position.x, position.y, 0, 35, 40, "Select Emotion", this.emotionsCommandsRight, element.data('index'));

          this.products[index].updateRightFeature(1, "Emotions");
        }




        //immer
        let children = element.data('children') || [];
        children.push(new_id);
        element.data('children', children);
        this.appendIdToDaddies(ele.id(), new_id);
        let new_element = this.cy.$('#' + new_id);
        let new_daddies = element.data('daddies') || [];
        new_daddies.push(ele.id());
        new_element.data('daddies', new_daddies);
        element.data('active', false);
      },
    };
  });


  // NACH PRICE
  this.priceCommandsRight = priceCommandsList.map((command) => {
    return {
      content: command,
      select: (ele : any) => {
        let element = this.cy.$('#' + ele.id());
        let position = element.position();
        let new_id = "wer"
        let index = element.data('index');

        this.removeChildNodes(ele.id());


        if (this.products[index].price_command == "De123lta") {

          //console.log("DELTADELTA")
          let new_id = this.addFeatureNodeBelowNoCxt(ele.id(), position.x, position.y, 0, 30, 35, "Select Calculation", this.metaPriceCommandsRight, element.data('index'));

          element.data('label', command);

          // update products
          //console.log("DER INDEX")
          this.products[index].updateRightFeature(2, command);

          //this.removeChildNodes(ele.id());


          this.setCmdForNode(new_id, this.metaPriceCommandsRight, "Delta")

          element.data('active', false);

          let children = element.data('children') || [];
          children.push(new_id);
          element.data('children', children);

          let new_element = this.cy.$('#' + new_id);
          let new_daddies = element.data('daddies') || [];
          new_daddies.push(ele.id());
          new_element.data('daddies', new_daddies);



        } else {
          if (command == "Cancel") {
            //console.log("ok servus");
            //this.cy.$('#' + ele.id()).data('lvl', '1');
          } else {
            //console.log(command, 'selected for', ele.id());
            element.data('label', command);

            if (this.products[index].price_command == "Delta") {
              new_id = this.addFeatureNodeBelowNoCxt(ele.id(), position.x, position.y, 0, 30, 35, "Select Calculation", this.metaPriceCommandsRightDelta, element.data('index'));
              //this.setCmdForNode(new_id, this.metaPriceCommandsRight, "Delta")
            } else {
              new_id = this.addFeatureNodeBelow(ele.id(), position.x, position.y, 0, 30, 35, "Select Calculation", this.metaPriceCommandsRight, element.data('index'));
            }

            this.products[index].updateRightFeature(2, command);
            //element.data('lvl', 'emotions');
            //console.log(ele.lvl);

          }
        }


        //if (this.products[index].price_command == "Delta") {
        //  this.setCmdForNode(new_id, this.metaPriceCommandsRight, "Delta")
        //}

        let children = element.data('children') || [];
        children.push(new_id);
        element.data('children', children);
        this.appendIdToDaddies(ele.id(), new_id);

        let new_element = this.cy.$('#' + new_id);
        let new_daddies = element.data('daddies') || [];
        new_daddies.push(ele.id());
        new_element.data('daddies', new_daddies);


        element.data('active', false);

        if (this.products[index].price_command == "Delta") {
          this.setCmdForNode(new_id, this.metaPriceCommandsRightDelta, "Delta")
        }


      },
    };
  });


  this.metaPriceCommandsRightDelta = metaPriceCommandsListRightDelta.map((command) => {
    return {
      content: command,
      select: (ele : any) => {
        let element = this.cy.$('#' + ele.id());
        let position = element.position();
        let new_id = "wer"
        let index = element.data('index');

        this.removeChildNodes(ele.id());

        if (command == "Cancel") {
          //console.log("ok servus");
          //this.cy.$('#' + ele.id()).data('lvl', '1');
        }  else if (command == "Delta") {
          //console.log(command, 'selected for', ele.id());
          element.data('label', command);
          let new_id1 = this.addFeatureNodeBelow(ele.id(), position.x, position.y, -18, 23, 30, "Day from", this.numbersCommandRight, element.data('index'), "left");
          let new_id2 = this.addFeatureNodeBelow(ele.id(), position.x, position.y, 18, 23, 30, "Day to", this.numbersCommandRight, element.data('index'), "right");

          let children1 = element.data('children') || [];
          children1.push(new_id1);
          element.data('children', children1);
          this.appendIdToDaddies(ele.id(), new_id1);

          let new_element1 = this.cy.$('#' + new_id1);
          let new_daddies1= element.data('daddies') || [];
          new_daddies1.push(ele.id());
          new_element1.data('daddies', new_daddies1);


          let children2 = element.data('children') || [];
          children2.push(new_id2);
          element.data('children', children2);
          this.appendIdToDaddies(ele.id(), new_id2);

          let new_element2 = this.cy.$('#' + new_id2);
          let new_daddies2 = element.data('daddies') || [];
          new_daddies2.push(ele.id());
          new_element2.data('daddies', new_daddies2);

          this.products[index].updateRightFeature(3, command);
          //element.data('lvl', 'business');
        }

        element.data('active', false);

      },
    };
  });

  this.metaPriceCommandsRight = metaPriceCommandsListRight.map((command) => {
    return {
      content: command,
      select: (ele : any) => {
        let element = this.cy.$('#' + ele.id());
        let position = element.position();
        let new_id = "wer"
        let index = element.data('index');

        this.removeChildNodes(ele.id());

        if (command == "Cancel") {
          //console.log("ok servus");
          //this.cy.$('#' + ele.id()).data('lvl', '1');
        } else if (command == "MovingAverage") {
          //console.log(command, 'selected for', ele.id());
          element.data('label', command);

          let new_id1 = this.addFeatureNodeBelow(ele.id(), position.x, position.y, -18, 23, 30, "Day from", this.numbersCommandRight, element.data('index'), "left");
          let new_id2 = this.addFeatureNodeBelow(ele.id(), position.x, position.y, 18, 23, 30, "Day to", this.numbersCommandRight, element.data('index'), "right");

          let children1 = element.data('children') || [];
          children1.push(new_id1);
          element.data('children', children1);
          this.appendIdToDaddies(ele.id(), new_id1);

          let new_element1 = this.cy.$('#' + new_id1);
          let new_daddies1= element.data('daddies') || [];
          new_daddies1.push(ele.id());
          new_element1.data('daddies', new_daddies1);


          let children2 = element.data('children') || [];
          children2.push(new_id2);
          element.data('children', children2);
          this.appendIdToDaddies(ele.id(), new_id2);

          let new_element2 = this.cy.$('#' + new_id2);
          let new_daddies2 = element.data('daddies') || [];
          new_daddies2.push(ele.id());
          new_element2.data('daddies', new_daddies2);

          this.products[index].updateRightFeature(3, command);



          //element.data('lvl', 'business');
        } else if (command == "Value itself") {
          //console.log(command, 'selected for', ele.id());
          element.data('label', command);
          new_id = this.addFeatureNodeBelow(ele.id(), position.x, position.y, 0, 25, 30, "Select Day from", this.numbersCommandRight, element.data('index'), "middle");

          let children = element.data('children') || [];
          children.push(new_id);
          element.data('children', children);
          this.appendIdToDaddies(ele.id(), new_id);

          let new_element = this.cy.$('#' + new_id);
          let new_daddies = element.data('daddies') || [];
          new_daddies.push(ele.id());
          new_element.data('daddies', new_daddies);
          //element.data('lvl', 'business');

          this.products[index].updateRightFeature(3, command);


        }

        element.data('active', false);

      },
    };
  });


  this.numbersCommandRight = numbersDaysCommandsList.map((command) => {
    return {
      content: command,
      select: (ele : any) => {
        // first remove all other children of this node
        this.removeChildNodes(ele.id());
        let element = this.cy.$('#' + ele.id());
        let position = element.position();
        let new_id = "wer"

        let index = element.data('index');
        let lastNode = element.data('last');

        if (command == 0) {
          //console.log("ok servus");
          //this.cy.$('#' + ele.id()).data('lvl', '1');
        } else {
          //console.log(command, 'selected for', ele.id());
          element.data('label', command);
          //console.log("SERVUS BEI MIR IS KOMPLIZIERTER");
          //console.log(lastNode);
          //this.cy.$('#' + ele.id()).data('lvl', '3');
          //this.cy.$('#' + ele.id()).data('feature', command);

          //console.log(ele.lvl);

          //console.log("ja den hammer eig");
          //console.log(new_id);

          // 4 wenns links oder middle is, sonst 5
          if (element.data('lastPos') == "left" || element.data('lastPos') == "middle") {
            //console.log("gmgm")
            this.products[index].updateRightFeature(4, String(command));
          } else {
            //console.log("gmmmmmmmmm")
            this.products[index].updateRightFeature(5, String(command));
          }
        }

        // den jetzigen auf inaktiv setzen
        element.data('active', false);

        if (this.products[index].isRightComplete()) { // if it was the last one, we calculate the whole feature






          let new_daddies = element.data('daddies') || [];
          //console.log("IHWEFHFWEIEWFWEFIHFWFEIJ")
          //console.log(element.data('daddies')[new_daddies.length - 1])
          let daddy_id = element.data('daddies')[new_daddies.length - 1];
          let daddy = this.cy.$('#' + daddy_id);
          //console.log(daddy)
          let childs = daddy.data('children');
          //console.log(childs)
          this.removeChildNodes(childs[0]);
          this.removeChildNodes(childs[1]);
          this.removeChildNodes(childs[3]);
          this.removeChildNodes(childs[2]);
          position = daddy.position();

          new_id = this.addInfoNodeBelow(daddy_id, position.x, position.y, 0, 50, 30, "", element.data('index'), this.products[index].right_features);
          this.updateNodeString(this.products[index].right_features, new_id);
          let children = element.data('children') || [];
          children.push(new_id);
          element.data('children', children);
          this.appendIdToDaddies(ele.id(), new_id);

          let new_element = this.cy.$('#' + new_id);
          //new_daddies.push(ele.id());
          new_element.data('daddies', new_daddies);

          let bottom_id = this.products[index].bottom
        this.cy.cxtmenu({
          openMenuEvents: 'cxttapstart mousedown',
          fillColor: 'rgba(0, 0, 0, 0.92)',
          selector: 'node[id="' + bottom_id + '"]',
          commands: this.compareCommands,
        });
        let bottom_element = this.cy.$('#' + bottom_id);
        bottom_element.data('label', "Choose Comparison")
        bottom_element.data('active', 'true')

        } else { // if it was not the last one, we calculate a single value for the respective day
          //new_id = this.addInfoNodeBelow(ele.id(), position.x, position.y, 0, 25, 30, "", element.data('index'), this.products[index].right_features);
          //this.updateNodeString(this.products[index].right_features, new_id);
          //let children = element.data('children') || [];
          //children.push(new_id);
          //element.data('children', children);
          //this.appendIdToDaddies(ele.id(), new_id);

          //let new_element = this.cy.$('#' + new_id);
          //let new_daddies = element.data('daddies') || [];
          //new_daddies.push(ele.id());
          //new_element.data('daddies', new_daddies);
          //console.log("one done")
        }
      },
    };
  });





  this.businessCommandsRight = businessCommandsList.map((command) => {
    return {
      content: command,
      select: (ele : any) => {

        // label neu festlegen
        let element = this.cy.$('#' + ele.id());
        let position = element.position();
        let new_id = "wer"
        let index = element.data('index');

        // alles drunter und rechts loeschen
        this.removeChildNodes(ele.id());

        // neue node anlegen, eigenes label updaten
        //console.log(command, 'selected for', ele.id());
        element.data('label', command);
        element.data('active', false);
        new_id = this.addFeatureNodeBelow(ele.id(), position.x, position.y, 0, 30, 35, "Select Quarter", this.quarterCommandsRight, element.data('index'));
        this.products[index].updateRightFeature(2, command);
        //element.data('lvl', 'emotions');
        //console.log(ele.lvl);

        // children aktualisieren
        let children = element.data('children') || [];
        children.push(new_id);
        element.data('children', children);
        this.appendIdToDaddies(ele.id(), new_id);

        // daddies aktualisieren
        let new_element = this.cy.$('#' + new_id);
        let new_daddies = element.data('daddies') || [];
        new_daddies.push(ele.id());
        new_element.data('daddies', new_daddies);

        //console.log("OKOKOKOKOKKOOK");
        //console.log(element);
        //console.log(new_element);

      },
    };
  });


  this.businessYearlyCommandsRight = businessCommandsYearlyList.map((command) => {
    return {
      content: command,
      select: (ele : any) => {

        // label neu festlegen
        let element = this.cy.$('#' + ele.id());
        let position = element.position();
        let new_id = "wer"
        let index = element.data('index');

        // alles drunter und rechts loeschen
        this.removeChildNodes(ele.id());

        // neue node anlegen, eigenes label updaten
        //console.log(command, 'selected for', ele.id());
        element.data('label', command);
        element.data('active', false);
        new_id = this.addFeatureNodeBelow(ele.id(), position.x, position.y, 0, 30, 35, "Select Year", this.yearCommandsRight, element.data('index'));
        this.products[index].updateRightFeature(2, command);
        //element.data('lvl', 'emotions');
        //console.log(ele.lvl);

        // children aktualisieren
        let children = element.data('children') || [];
        children.push(new_id);
        element.data('children', children);
        this.appendIdToDaddies(ele.id(), new_id);

        // daddies aktualisieren
        let new_element = this.cy.$('#' + new_id);
        let new_daddies = element.data('daddies') || [];
        new_daddies.push(ele.id());
        new_element.data('daddies', new_daddies);

        //console.log("OKOKOKOKOKKOOK");
        //console.log(element);
        //console.log(new_element);

      },
    };
  });

  this.emotionsCommandsRight = emotionsCommandsList.map((command) => {
    return {
      content: command,
      select: (ele : any) => {

        // label neu festlegen
        let element = this.cy.$('#' + ele.id());
        let position = element.position();
        let new_id = "wer"
        let index = element.data('index');

        // alles drunter und rechts loeschen
        this.removeChildNodes(ele.id());

        // neue node anlegen, eigenes label updaten
        //console.log(command, 'selected for', ele.id());
        element.data('label', command);
        element.data('active', false);
        new_id = this.addFeatureNodeBelow(ele.id(), position.x, position.y, 0, 30, 35, "Select Quarter", this.quarterCommandsRight, element.data('index'));
        this.products[index].updateRightFeature(2, command);
        //element.data('lvl', 'emotions');
        //console.log(ele.lvl);

        // children aktualisieren
        let children = element.data('children') || [];
        children.push(new_id);
        element.data('children', children);
        this.appendIdToDaddies(ele.id(), new_id);

        // daddies aktualisieren
        let new_element = this.cy.$('#' + new_id);
        let new_daddies = element.data('daddies') || [];
        new_daddies.push(ele.id());
        new_element.data('daddies', new_daddies);

        //console.log("OKOKOKOKOKKOOK");
        //console.log(element);
        //console.log(new_element);

      },
    };
  });

  this.quarterCommandsRight = quarterCommandsList.map((command) => {
    return {
      content: command,
      select: (ele : any) => {


        // first remove all other children of this node

        this.removeChildNodes(ele.id());
        let element = this.cy.$('#' + ele.id());
        let position = element.position();
        let new_id = "wer"

        let index = element.data('index');
        let lastNode = element.data('last');


        //console.log(command, 'selected for', ele.id());
        element.data('label', command);
        //console.log("SERVUS BEI MIR IS KOMPLIZIERTER");
        //console.log(lastNode);
        //this.cy.$('#' + ele.id()).data('lvl', '3');
        //this.cy.$('#' + ele.id()).data('feature', command);

        //console.log(ele.lvl);

        //console.log("ja den hammer eig");
        //console.log(new_id);

        // map: last to 1, 2nd last 2, 3rd last 3, average 0

        let command_int = 0;
        switch (command) {
          case 'last quarter':
              command_int =  1;
              break;
          case '2nd last quarter':
              command_int =  2;
              break;
          case '3rd last quarter':
              command_int =  3;
              break;
          case 'average of last 3':
              command_int =  0;
              break;
          default:
              //console.log("invalid command")
      }

        this.products[index].updateRightFeature(3, String(command_int));


        // den jetzigen auf inaktiv setzen
        element.data('active', false);

        //console.log("etz wars der letzte")
        //console.log("ETZEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEERT WARS DER LETZTE JUHU")

        new_id = this.addInfoNodeBelow(ele.id(), position.x, position.y, 0, 25, 30, "", element.data('index'), this.products[index].right_features);
        this.updateNodeString(this.products[index].right_features, new_id);
        let children = element.data('children') || [];
        children.push(new_id);
        element.data('children', children);
        this.appendIdToDaddies(ele.id(), new_id);

        let new_element = this.cy.$('#' + new_id);
        let new_daddies = element.data('daddies') || [];
        new_daddies.push(ele.id());
        new_element.data('daddies', new_daddies);

        let bottom_id = this.products[index].bottom
        this.cy.cxtmenu({
          openMenuEvents: 'cxttapstart mousedown',
          fillColor: 'rgba(0, 0, 0, 0.92)',
          selector: 'node[id="' + bottom_id + '"]',
          commands: this.compareCommands,
        });
        let bottom_element = this.cy.$('#' + bottom_id);
        bottom_element.data('label', "Choose Comparison")
        bottom_element.data('active', 'true')

      },
    };
  });

  this.yearCommandsRight = yearCommandsList.map((command) => {
    return {
      content: command,
      select: (ele : any) => {


        // first remove all other children of this node

        this.removeChildNodes(ele.id());
        let element = this.cy.$('#' + ele.id());
        let position = element.position();
        let new_id = "wer"

        let index = element.data('index');
        let lastNode = element.data('last');


        //console.log(command, 'selected for', ele.id());
        element.data('label', command);
        //console.log("SERVUS BEI MIR IS KOMPLIZIERTER");
        //console.log(lastNode);
        //this.cy.$('#' + ele.id()).data('lvl', '3');
        //this.cy.$('#' + ele.id()).data('feature', command);

        //console.log(ele.lvl);

        //console.log("ja den hammer eig");
        //console.log(new_id);

        // map: last to 1, 2nd last 2, 3rd last 3, average 0

        let command_int = 0;
        switch (command) {
          case 'last year':
              command_int =  1;
              break;
          case '2nd last year':
              command_int =  2;
              break;
          case '3rd last year':
              command_int =  3;
              break;
          case 'average of last 3':
              command_int =  0;
              break;
          default:
              //console.log("invalid command")
      }

        this.products[index].updateRightFeature(3, String(command_int));


        // den jetzigen auf inaktiv setzen
        element.data('active', false);

        //console.log("etz wars der letzte")
        //console.log("ETZEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEERT WARS DER LETZTE JUHU")

        new_id = this.addInfoNodeBelow(ele.id(), position.x, position.y, 0, 25, 30, "", element.data('index'), this.products[index].right_features);
        this.updateNodeString(this.products[index].right_features, new_id);
        let children = element.data('children') || [];
        children.push(new_id);
        element.data('children', children);
        this.appendIdToDaddies(ele.id(), new_id);

        let new_element = this.cy.$('#' + new_id);
        let new_daddies = element.data('daddies') || [];
        new_daddies.push(ele.id());
        new_element.data('daddies', new_daddies);

        //console.log("haja servuce")


        let bottom_id = this.products[index].bottom
        this.cy.cxtmenu({
          openMenuEvents: 'cxttapstart mousedown',
          fillColor: 'rgba(0, 0, 0, 0.92)',
          selector: 'node[id="' + bottom_id + '"]',
          commands: this.compareCommands,
        });
        let bottom_element = this.cy.$('#' + bottom_id);
        bottom_element.data('label', "Choose Comparison")
        bottom_element.data('active', 'true')


      },
    };
  });


  this.compareCommands = compareCommandsList.map((command) => {
    return {
      content: command,
      select: (ele : any) => {



        let element = this.cy.$('#' + ele.id());
        let position = element.position();
        //console.log(command, 'selected for', ele.id());
        element.data('label', command);
        element.data('active', 'false');

        let index = element.data('index');
        this.products[index].comparison[0] = command;
        //console.log(this.products[index])
        //console.log(this.products)
        this.checkStrategy();



      },
    };
  });


  }
  ngOnDestroy() {
    window.removeEventListener('resize', this.adjustCytoscapeHeight);
  }
}
