<template>
    <div>
        <router-link to="/">Back</router-link>
        <el-table v-loading="loading" :data="tableList">
            <el-table-column prop="table_name" label="表名">

            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    import db from "@/mysql/dbmanager";

    export default {
        name: "ConnectionDetails",
        data() {
            return {
                loading: false,
                tableList: [],
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
            self.queryTables(params.schema)
        },

        methods: {
            queryTables(schema) {
                let self = this;
                let sql = "select table_name from information_schema.tables where table_schema = '" + schema + "';";
                db.query(sql, function (err, rows) {
                    self.loading = false;
                    self.tableList = rows;
                });
            }
        }

    }
</script>

<style scoped>

</style>
