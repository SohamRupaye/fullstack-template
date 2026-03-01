import { Prisma } from "database";

export const getPrismaError = (error: Prisma.PrismaClientKnownRequestError) => {
  let errorCode: string | undefined;
  let message = "An unexpected error occurred";
  let fields: string[] | undefined;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      // Prisma Constraint & Validation Errors
      case "P2000":
        errorCode = "VALUE_TOO_LONG";
        fields = [error.meta?.column_name as string].filter(Boolean);
        message = `Value is too long for column${fields?.length ? `: ${fields.join(", ")}` : ""}`;
        break;
      case "P2001":
        errorCode = "RECORD_NOT_FOUND";
        message = `The requested record does not exist${error.meta?.modelName ? ` in ${error.meta.modelName}` : ""}`;
        break;
      case "P2002":
        errorCode = "UNIQUE_CONSTRAINT";
        fields = (error.meta?.target as string[]) || [];
        message = `Unique constraint failed on field(s): ${fields.join(", ")}`;
        break;
      case "P2003":
        errorCode = "FOREIGN_KEY_CONSTRAINT";
        const constraint = error.meta?.constraint as string | undefined;
        message = constraint
          ? `Foreign key constraint failed: ${constraint}`
          : "Foreign key constraint failed";
        break;
      /**
       * Can show user as is
       */
      case "P2004":
        errorCode = "CONSTRAINT_FAILED";
        message = "A database constraint failed";
        break;
      case "P2005":
        errorCode = "INVALID_VALUE";
        message = "Invalid value stored in the database";
        break;
      case "P2006":
        errorCode = "INVALID_TYPE";
        message = "Mismatched data type in the database";
        break;
      case "P2007":
        errorCode = "INVALID_QUERY";
        message = "Data validation error in the query";
        break;
      case "P2008":
        errorCode = "QUERY_PARSE_ERROR";
        message = "Query parsing failed";
        break;
      case "P2009":
        errorCode = "QUERY_VALIDATION_ERROR";
        message = "Query validation failed";
        break;
      case "P2010":
        errorCode = "RAW_QUERY_ERROR";
        message = "Raw database query execution failed";
        break;
      /**
       * End: Can show user as is
       */

      case "P2011":
        errorCode = "NULL_CONSTRAINT";
        fields = [error.meta?.column_name as string].filter(Boolean);
        message = `A required value is null${fields?.length ? ` (column: ${fields.join(", ")})` : ""}`;
        break;
      case "P2012":
        errorCode = "MISSING_REQUIRED_FIELD";
        fields = [error.meta?.argument_name as string].filter(Boolean);
        message = `Missing required field${fields?.length ? `: ${fields.join(", ")}` : ""}`;
        break;

      /**
       * Can show user as is
       */
      case "P2013":
        errorCode = "MISSING_ARGUMENT";
        message = "Missing argument in the query";
        break;
      case "P2014":
        errorCode = "MULTIPLE_RELATION_ERROR";
        message = "Relation violation between multiple records";
        break;
      /**
       * End: Can show user as is
       */

      case "P2015":
        errorCode = "RECORD_NOT_FOUND";
        message = "Record required but not found";
        break;

      /**
       * Can show user as is
       */
      case "P2016":
        errorCode = "QUERY_INTERPRETATION_ERROR";
        message = "Query interpretation error";
        break;
      case "P2017":
        errorCode = "RELATION_VIOLATION";
        message = "Incorrect relation found in query";
        break;
      case "P2018":
        errorCode = "RECORD_NOT_LINKED";
        message = "The required record is not connected";
        break;

      // Server & Connection Errors
      case "P2019":
        errorCode = "INVALID_INPUT";
        message = "Invalid data input for the query";
        break;
      case "P2020":
        errorCode = "VALUE_OUT_OF_RANGE";
        message = "Value is out of allowed range";
        break;
      case "P2021":
        errorCode = "TABLE_NOT_FOUND";
        message = "Table not found in the database";
        break;
      case "P2022":
        errorCode = "COLUMN_NOT_FOUND";
        message = "Column not found in the database";
        break;
      case "P2023":
        errorCode = "INVALID_COLUMN_TYPE";
        message = "Column type mismatch";
        break;
      case "P2024":
        errorCode = "TRANSACTION_FAILED";
        message = "Transaction failed due to integrity issues";
        break;
      case "P2025":
        errorCode = "RECORD_NOT_FOUND";
        message = (error.meta?.cause as string) || "Record not found";
        break;
      /**
       * End: Can show user as is
       */

      default:
        break;
    }
  }

  return { errorCode, message, fields };
};
