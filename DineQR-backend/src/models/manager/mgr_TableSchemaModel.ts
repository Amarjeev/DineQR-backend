import mongoose, { Schema, Document, Types } from "mongoose";

interface TableItem {
  _id?: Types.ObjectId;
  name: string; // table name
  isDeleted: boolean; // individual deletion flag
}

interface TableDoc extends Document {
  hotelKey: string;
  tableNames: TableItem[]; // now array of objects with name + isDeleted
}

const TableItemSchema = new Schema<TableItem>({
  name: { type: String, required: true, trim: true, uppercase: true }, // auto uppercase
  isDeleted: { type: Boolean, default: false },
});

const TableSchema = new Schema<TableDoc>({
  hotelKey: { type: String, required: true, index: true },
  tableNames: { type: [TableItemSchema], required: true, default: [] }, // array of objects
});

const tableSchema = mongoose.model<TableDoc>("table_list", TableSchema);
export default tableSchema;
