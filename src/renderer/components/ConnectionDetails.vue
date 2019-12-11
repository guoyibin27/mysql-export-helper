<template>
    <div>
        <el-row :gutter="20">
            <el-col :span="2">
                <router-link to="/">首页</router-link>
            </el-col>
            <el-col :span="2" :offset="20">
                <!--                <el-link type="primary" @click="preview">Next</el-link>-->
                <el-dropdown trigger="click" @command="handleCommand">
                    <span class="el-dropdown-link">
                        导出<i class="el-icon-arrow-down el-icon--right"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="html">HTML</el-dropdown-item>
                        <el-dropdown-item command="markdown">Markdown</el-dropdown-item>
                        <el-dropdown-item command="excel">Excel</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </el-col>
        </el-row>

        <el-table v-loading="loading" :data="tableData" ref="tableList"
                  @selection-change="handleSelectionChange"
                  highlight-current-row
                  border>
            <el-table-column type="selection" width="55" align="center">
            </el-table-column>
            <el-table-column label="表名" prop="tableName">
            </el-table-column>
        </el-table>

        <el-row :gutter="20">
            <el-col :span="2">
                <router-link to="/">首页</router-link>
            </el-col>
            <el-col :span="2" :offset="20">
                <el-dropdown trigger="click" @command="handleCommand">
                    <span class="el-dropdown-link">
                        导出<i class="el-icon-arrow-down el-icon--right"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="html">HTML</el-dropdown-item>
                        <el-dropdown-item command="markdown">Markdown</el-dropdown-item>
                        <el-dropdown-item command="excel">Excel</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import sqls from '@/mysql/sqls';

    export default {
        name: "ConnectionDetails",
        data() {
            return {
                loading: false,
                tableData: [],
                selectTableList: [],
                params: null,
                filename: ""
            }
        },
        mounted() {
            let self = this;
            let connectionInfoStr = sessionStorage.getItem("CURRENT_CONNECTION");
            this.params = JSON.parse(connectionInfoStr);
            self.loading = true;
            this.database.connectDb(this.params);
            this.queryTables(this.params.schema)
        },
        methods: {
            async queryTables(schema) {
                this.tableData = await this.database.query(sqls.SQL_SELECT_TABLE_LIST, [schema]);
                this.loading = false;
            },
            handleSelectionChange(val) {
                this.selectTableList = val;
            },
            preview() {
                console.error(this.selectTableList);
                if (!this.selectTableList || this.selectTableList.length === 0) {
                    this.showMessage("请选择表");
                    return
                }

                let key = "SELECTED_TABLE";
                let currentSchema = "CURRENT_SCHEMA";
                sessionStorage.removeItem(key);
                sessionStorage.removeItem(currentSchema);
                let selectedTableJson = JSON.stringify(this.selectTableList);
                sessionStorage.setItem(key, selectedTableJson);
                sessionStorage.setItem(currentSchema, this.params.schema);

                this.$router.push({path: "/preview"});
            },

            showMessage(message, title, callback) {
                this.$alert(message, title, {
                    confirmButtonText: "确定",
                    callback: action => {
                        if (callback) {
                            callback()
                        }
                    }
                })
            },
            async queryTablesInfo(tableName) {
                let columns = await this.database.query(sqls.SQL_SELECT_TABLE_COLUMNS, [this.params.schema, tableName]);
                return {
                    tableName: tableName,
                    columns: columns
                };
            },
            async prepareData() {
                let tableNameArray = this.selectTableList.map(data => data.tableName);
                let result = [];
                for (const name of tableNameArray) {
                    result.push(await this.queryTablesInfo(name))
                }
                result = result.sort((obj1, obj2) => {
                    let o1 = obj1.tableName;
                    let o2 = obj2.tableName;
                    if (o1 < o2) {
                        return -1;
                    } else if (o1 > o2) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                return {
                    databaseName: this.params.schema,
                    tableList: result
                };
            },
            async handleCommand(command) {
                let self = this;
                switch (command) {
                    case 'html': {
                        if (this.checkSelected()) {
                            let data = await self.prepareData();
                            let path = require('path');
                            let templateFilePath = path.resolve(__dirname, "../template/html_template.ejs");

                            let ejs = require('ejs');
                            ejs.renderFile(templateFilePath, {data: data}, function (err, data) {
                                if (err) {
                                    self.showMessage('发生错误');
                                } else {
                                    self.saveFile(data, 'html');
                                }
                            })
                        }
                        break;
                    }
                    case 'markdown': {
                        if (this.checkSelected()) {
                            let data = await self.prepareData();
                            let content = self.markdownText(data);
                            self.saveFile(content, 'md');
                        }
                        break;
                    }
                    case 'excel': {
                        if (this.checkSelected()) {
                            let data = await self.prepareData();
                            let headerRow = ['Field', 'Type', 'Collation', 'Charset', 'Null', 'Key', 'Default', 'Comment'];
                            let conf = {};
                            conf.name = "Schema for " + this.params.schema;
                            conf.cols = [
                                {
                                    caption: "Field",
                                    type: 'string'
                                },
                                {
                                    caption: "Type",
                                    type: 'string'
                                },
                                {
                                    caption: "Collation",
                                    type: 'string'
                                },
                                {
                                    caption: "Charset",
                                    type: 'string'
                                }, {
                                    caption: "Null",
                                    type: 'string'
                                },
                                {
                                    caption: "Key",
                                    type: 'string'
                                },
                                {
                                    caption: "Default",
                                    type: 'string'
                                },
                                {
                                    caption: "Comment",
                                    type: 'string'
                                }];
                            console.error(data.tableList[0].columns);
                            let allData = [];
                            data.tableList[0].columns.forEach(column => {
                                let row = [];
                                row.push(column.columnName);
                                row.push(column.columnType);
                                row.push(column.collationName);
                                row.push(column.characterSetName);
                                row.push(column.isNullable);
                                row.push(column.columnKey);
                                row.push(column.columnDefault);
                                row.push(column.columnComment);
                                allData.push(row);
                            });
                            conf.rows = allData;
                            let excelExport = require('excel-export');
                            let result = excelExport.execute(conf);
                            self.saveFile(result, "xlsx");
                        }
                        break;
                    }
                }
            },
            saveFile(content, fileExt) {
                let blob = new Blob([content]);
                let saveBtn = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
                let urlObject = window.URL || window.webkitURL || window;
                saveBtn.href = urlObject.createObjectURL(blob);
                saveBtn.download = "scheme-for-" + this.params.schema + "." + fileExt;
                let event = document.createEvent("MouseEvents");
                event.initMouseEvent(
                    "click", true, false, window,
                    0, 0, 0, 0, 0,
                    false, false, false, false, 0, null
                );
                saveBtn.dispatchEvent(event);
            },
            checkSelected() {
                if (!this.selectTableList || this.selectTableList.length === 0) {
                    this.showMessage("请选择表");
                    return false
                }
                return true
            },
            markdownText(data) {
                let content = "# Schema for '" + this.params.schema + "' \n <a name=\"header\"></a> \n";
                data.tableList.forEach(table => {
                    let temp = "\n+ <a href='#" + table.tableName + "'>" + table.tableName;
                    if (table.tableComment) {
                        temp += "(" + table.tableComment + ")";
                    }
                    temp += "</a>";
                    content += temp;
                });

                content += "\r\n\r\n";

                data.tableList.forEach(table => {
                    let temp = "<a href=\"" + table.tableName + "\"></a>\r\n ## " + table.tableName + " \r\n";
                    temp += "Field|Type|Collation|Charset|Null|Key|Default|Comment\n----:|---:|--------:|------:|---:|--:|------:|------:\r\n";
                    table.columns.forEach(column => {
                        if (column.columnComment.indexOf("\r\n") !== -1 || column.columnComment.indexOf("\n") !== -1 || column.columnComment.indexOf("\r") !== -1) {
                            temp += column.columnName + "|" + column.columnType + "|" + column.collationName + "|" + column.characterSetName + "|" + column.isNullable + "|" + column.columnKey + "|" + column.columnDefault + "|" + column.columnComment;
                        } else {
                            temp += column.columnName + "|" + column.columnType + "|" + column.collationName + "|" + column.characterSetName + "|" + column.isNullable + "|" + column.columnKey + "|" + column.columnDefault + "|" + column.columnComment + "\r\n";
                        }

                    });
                    temp += "<a href=\"#header\">Back</a> \r\n";
                    content += temp;
                });
                return content;
            }
        }

    }
</script>

<style scoped>
    .el-dropdown-link {
        cursor: pointer;
        color: #409EFF;
    }

    .el-icon-arrow-down {
        font-size: 12px;
    }
</style>
