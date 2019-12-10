<template>
    <div>
        <router-link to="/">Back</router-link>
        <el-table v-loading="loading" :data="tableData" ref="tableList"
                  @selection-chang="handleSelectionChange"
                  height="200px"
                  stripe
                  highlight-current-row
                  border>
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column label="表名">
                <template slot-scope="scope"><span>{{scope.row}}</span></template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    import db from "@/mysql/dbmanager";
    import sqls from '@/mysql/sqls';

    export default {
        name: "ConnectionDetails",
        data() {
            return {
                loading: false,
                tableData: [],
                selectTableList: []
            }
        },
        mounted() {
            let self = this;
            self.loading = true;
            let params = {
                hostName: this.$route.query.h,
                port: this.$route.query.p,
                username: this.$route.query.u,
                password: this.$route.query.pwd,
                schema: this.$route.query.s
            };
            db.connectDb(params);
            // let sql = "select * from information_schema.columns " +
            //     "where table_schema ='" + params.schema + "' ;";
            // db.query(sql, function (err, rows) {
            //     self.loading = false;
            //     console.error(rows)
            // })
            this.queryTables(params.schema)
        },
        methods: {
            async queryTables(schema) {
                let result = await db.query(sqls.SQL_SELECT_TABLE_LIST, [schema]);
                // this.tableData = result;
                for (let item of result) {
                    this.tableData.push(item.tableName)
                }
                console.error(this.tableData);
                this.loading = false;
            },
            handleSelectionChange(val) {
                this.selectTableList = val;
            }
        }

    }
</script>

<style scoped>

</style>
