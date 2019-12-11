export default {
    SQL_SELECT_TABLE_LIST: "select table_name as tableName, table_comment as comment from information_schema.tables where table_schema = ? order by table_name asc;",
    SQL_SELECT_TABLE_COLUMNS: "select column_name as columnName, column_type as columnType, collation_name as collationName," +
        "character_set_name as characterSetName, is_nullable as isNullable, " +
        "column_key as columnKey, column_default as columnDefault, column_comment as columnComment" +
        " from information_schema.columns where table_schema =? and table_name =?;"
};
