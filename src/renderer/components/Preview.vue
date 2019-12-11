<template>
    <div>
        <el-container v-loading="loading">
            <el-main>
                <el-row :gutter="20" id="navigator">
                    <el-col :span="2">
                        <router-link to="/connection">Back</router-link>
                    </el-col>
                    <el-col :span="4" :offset="18">
                        <el-link type="primary" @click="exportHtml">Export HTML</el-link>
                    </el-col>
                </el-row>
                <el-row>
                    <div style="font-weight: bold;font-size: larger;text-align: center">Schema for '{{schema}}'</div>
                </el-row>
                <el-row v-for="item in selectedTables">
                    <el-link type="primary" :href="'#'+item.tableName">
                        {{item.tableName}} {{item.comment}}
                    </el-link>
                </el-row>
                <el-row v-for="(item) in tableInfos">
                    <el-link :href="item.tableName"/>
                    <el-table :data="item.columns">
                        <el-table-column :label="item.tableName" align="center">
                            <el-table-column label="Field" prop="COLUMN_NAME"></el-table-column>
                            <el-table-column label="Type" prop="COLUMN_TYPE"></el-table-column>
                            <el-table-column label="Collation" prop="COLLATION_NAME"></el-table-column>
                            <el-table-column label="Charset" prop="CHARACTER_SET_NAME"></el-table-column>
                            <el-table-column label="Null" prop="IS_NULLABLE"></el-table-column>
                            <el-table-column label="Key" prop="COLUMN_KEY"></el-table-column>
                            <el-table-column label="Default" prop="COLUMN_DEFAULT"></el-table-column>
                            <el-table-column label="Comment" prop="COLUMN_COMMENT"></el-table-column>
                        </el-table-column>
                    </el-table>
                </el-row>
            </el-main>
        </el-container>
    </div>
</template>

<script>
    import sqls from '@/mysql/sqls';

    export default {
        name: "Preview",
        data() {
            return {
                schema: "",
                selectedTables: [],
                tableInfos: [],
                loading: false
            }
        },
        mounted() {
            this.init();
        },
        methods: {
            async init() {
                let self = this;
                self.loading = true;
                let connectionInfoStr = sessionStorage.getItem("CURRENT_CONNECTION");
                let params = JSON.parse(connectionInfoStr);
                this.database.connectDb(params);
                let key = "SELECTED_TABLE";
                let currentSchema = "CURRENT_SCHEMA";
                let selectedTablesStr = sessionStorage.getItem(key);
                this.schema = sessionStorage.getItem(currentSchema);
                this.selectedTables = JSON.parse(selectedTablesStr);
                let tableNameArray = this.selectedTables.map(data => data.tableName);
                let result = [];
                for (const name of tableNameArray) {
                    result.push(await self.queryTablesInfo(name))
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
                this.tableInfos = result;
                self.loading = false;
            },
            async queryTablesInfo(tableName) {
                let columns = await this.database.query(sqls.SQL_SELECT_TABLE_COLUMNS, [this.schema, tableName]);
                return {
                    tableName: tableName,
                    columns: columns
                };
            },
            exportHtml() {
                let htmlBody = document.getElementsByTagName("html")[0].outerHTML;
                let navigator = document.getElementById("navigator").outerHTML;
                htmlBody = htmlBody.replace(navigator, "");
                let blob = new Blob([htmlBody]);
                let saveBtn = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
                let urlObject = window.URL || window.webkitURL || window;
                saveBtn.href = urlObject.createObjectURL(blob);
                saveBtn.download = "scheme-for-" + this.schema + ".html";
                let event = document.createEvent("MouseEvents");
                event.initMouseEvent(
                    "click", true, false, window,
                    0, 0, 0, 0, 0,
                    false, false, false, false, 0, null
                );
                saveBtn.dispatchEvent(event);
            }
        }
    }
</script>

<style scoped>

</style>
