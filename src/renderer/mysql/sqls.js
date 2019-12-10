export default {
    SQL_SELECT_TABLE_LIST: "select table_name as tableName from information_schema.tables where table_schema = ?;",
    SQL_SELECT_TABLE_COLUMNS: "select * from information_schema.columns where table_schema =? and table_name =?;"
};
