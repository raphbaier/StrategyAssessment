export class Product {

    left_features =["", "", "", "", "", ""];
    right_features =["", "", "", "", "", ""];
    comparison = [""];


    node_info_ids: string[] = [];
    node_info_features: string[][] = [];

    orientation_string = "";
    price_command = "";
    quarter_year_command = "";
  
    left: string;
    right: string;
    bottom: string;
  
    constructor(left: string, right: string, bottom: string) {
      this.left = left;
      this.right = right;
      this.bottom = bottom;
    }


    printValues() {
      //console.log("Left Features:", this.left_features);
      //console.log("Right Features:", this.right_features);
      //console.log("Left Node ID:", this.left);
      //console.log("Right Node ID:", this.right);
      //console.log("Bottom Node ID:", this.bottom);
  }

  updateLeftFeature(index: number, value: string) {

    if (index < this.left_features.length) {
        this.left_features[index] = value;

        // if it's a number, don't remove anything
        if (/^\d+$/.test(value)) {
          //console.log("Dats a namba so i wont remove anyfin.")
        } else {
          for (let i = index + 1; i < this.left_features.length; i++) {
            this.left_features[i] = "";
        }
        }
        this.printValues();
    }
}

updateRightFeature(index: number, value: string) {
    if (index < this.right_features.length) {
        this.right_features[index] = value;

        // if it's a number, don't remove anything
        if (/^\d+$/.test(value)) {
          //console.log("Dats a namba so i wont remove anyfin.")
        } else {
        for (let i = index + 1; i < this.right_features.length; i++) {
            this.right_features[i] = "";
        }
      }
        this.printValues();
    }
}


isLeftComplete(): boolean {
  //console.log("WER")
  if (this.left_features[1] == "Price") {
    let count = 0;
    let to_be_complete = 6;
    if (this.left_features[3] == 'Value itself' ) {
      to_be_complete = 5;
    }
    for (const feature of this.left_features) {
        if (feature !== "") {
            count++;
        }
        if (count >= to_be_complete) {
            return true;
        }
    }
    return false;
  } else {

    let count = 0;
    for (const feature of this.left_features) {
      if (feature !== "") {
          count++;
      }
      if (count >= 4) {
          return true;
      }
    }
    return false;
  }

}

isRightComplete(): boolean {
  if (this.right_features[1] == "Price") {
    let count = 0;
    let to_be_complete = 6;
    if (this.right_features[3] == 'Value itself' ) {
      to_be_complete = 5;
    }
    for (const feature of this.right_features) {
      if (feature !== "") {
          count++;
      }
      if (count >= to_be_complete) {
          return true;
      }
  }
    return false;
  } else {

  let count = 0;
    for (const feature of this.right_features) {
      if (feature !== "") {
          count++;
      }
      if (count >= 4) {
          return true;
      }
    }
    return false;
  }
 }

 isComplete(): boolean {
  return this.isLeftComplete() && this.isRightComplete() && this.comparison[0] !== "";
}

}