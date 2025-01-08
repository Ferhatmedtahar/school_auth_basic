//* a class which serve all the features which are used in getting data which is :filter , sort , limitFields ,pagination

import { Query } from "mongoose";

export class APIFeatures {
  query: Query<any, any>;

  queryString: any;

  //  we pass the query and the query string
  constructor(query: Query<any, any>, queryString: any) {
    this.query = query;
    this.queryString = queryString;
  }
  //  1 filter

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);
    //  the values which we want to specify : gte , gt, lte , lt
    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    this.query.find(JSON.parse(queryStr));
    return this;
  }

  //  2 sort
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
  //  3 fields :projecting the specified fields

  fields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query.select(fields);
    } else {
      this.query.select("-__v");
    }
    return this;
  }
  //  4pagination

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit; //  data before the start of the page
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
