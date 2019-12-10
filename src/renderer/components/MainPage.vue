<template>
    <div>
        <el-container v-loading="loading">
            <el-main>
                <div>
                    <div style="text-align: center; margin-top: 20px;font-size: xx-large;font-weight: bolder">
                        欢迎使用MySql数据导出助手
                    </div>
                    <div style="text-align: center; margin-top: 20px;font-size: large">
                        介绍..................
                    </div>
                </div>
                <div>
                    <el-row>
                        <span style="font-weight: bold; font-size: medium">MySQL Connections</span>
                        <el-button type="text" icon="el-icon-circle-plus-outline" circle @click="setupNewConnection"/>
                        <el-button type="text" icon="el-icon-s-tools" circle/>
                    </el-row>
                </div>
                <el-row>
                    <div v-for="item in dataList" @dblclick="openConnection(item)">
                        <el-card class="box-card" shadow="always">
                            <el-row>
                                {{item.connectionName}}
                            </el-row>
                            <el-row>
                                <el-icon class="el-icon-user-solid"/>
                                {{item.username}}
                            </el-row>
                            <el-row>
                                <el-icon class="el-icon-info"/>
                                {{item.hostName}}:{{item.port}}
                            </el-row>
                        </el-card>
                    </div>
                </el-row>

                <el-dialog title="Setup New Connection" :visible.sync="dialogVisible" width="80%">
                    <el-form ref="form" :model="newConnectionForm"
                             :rules="rules"
                             label-width="120px"
                             hide-required-asterisk
                             size="small">
                        <el-form-item label="Connection Name:" prop="connectionName">
                            <el-input v-model="newConnectionForm.connectionName"/>
                        </el-form-item>
                        <el-form :inline="true" label-width="120px" hide-required-asterisk="true" size="small">
                            <el-form-item label="Hostname:" prop="hostName">
                                <el-input v-model="newConnectionForm.hostName"/>
                            </el-form-item>
                            <el-form-item label="Port:">
                                <el-input v-model="newConnectionForm.port" prop="port"/>
                            </el-form-item>
                        </el-form>
                        <el-form-item label="Username:" prop="username">
                            <el-input v-model="newConnectionForm.username"/>
                        </el-form-item>
                        <el-form-item label="Password:" prop="password">
                            <el-input v-model="newConnectionForm.password"/>
                        </el-form-item>
                        <el-form-item>
                            <el-checkbox :checked="newConnectionForm.savePassword">保存密码</el-checkbox>
                        </el-form-item>
                        <el-form-item label="Schema:" prop="schema">
                            <el-input v-model="newConnectionForm.schema"/>
                        </el-form-item>
                        <el-form-item>
                            <el-button @click="testConnection">Test Connection</el-button>
                            <el-button @click="cancel">Cancel</el-button>
                            <el-button type="primary" @click="saveConnection">Save</el-button>
                        </el-form-item>
                    </el-form>
                </el-dialog>
            </el-main>
        </el-container>
    </div>
</template>

<script>
    import db from "@/mysql/dbmanager";

    export default {
        name: "MainPage",
        data() {
            return {
                dataList: [],
                dialogVisible: false,
                newConnectionForm: {
                    connectionName: "111",
                    hostName: "127.0.0.1",
                    port: "3306",
                    username: "root",
                    password: "111",
                    schema: "111",
                    savePassword: false
                },
                rules: {
                    connectionName: [
                        {required: true, message: "Please enter a proper name for your new connection", trigger: "blur"}
                    ]
                },
                loading: false
            }
        },
        mounted() {
            let connectionJsonStr = localStorage.getItem("CONNECTIONS");
            this.dataList = JSON.parse(connectionJsonStr);
        },
        methods: {
            setupNewConnection() {
                this.dialogVisible = true;
            },
            cancel() {
                this.$refs['form'].resetFields();
                this.dialogVisible = false;
            },

            testConnection() {
                let self = this;
                this.loading = true;
                let connection = {...self.newConnectionForm};
                db.testConnection(connection, function (status, error) {
                    if (status === "success") {
                        self.showMessage("连接测试成功", '', function () {
                            self.loading = false;
                        });
                    } else {
                        self.showMessage(error.message, '', function () {
                            self.loading = false;
                        });
                    }
                });
            },

            showMessage(message, title, callback) {
                this.$alert(message, title, {
                    confirmButtonText: "确定",
                    callback: action => {
                        callback()
                    }
                })
            },

            saveConnection() {
                let self = this;
                this.$refs['form'].validate((valid) => {
                    if (valid) {
                        let connection = {...self.newConnectionForm};
                        self.dataList.push(connection);
                        let jsonStr = JSON.stringify(this.dataList);
                        localStorage.setItem("CONNECTIONS", jsonStr);
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            openConnection(item) {
                let self = this;
                this.loading = true;
                db.testConnection(item, function (status, error) {
                    if (status === "success") {
                        self.loading = false;

                        let url = "/connection?c=" + item.connectionName +
                            "&h=" + item.hostName + "&p=" + item.port +
                            "&u=" + item.username + "&pwd=" + item.password +
                            "&s=" + item.schema;
                        self.$router.push({path: url});
                    } else {
                        self.showMessage(error.message, '', function () {
                            self.loading = false;
                        });
                    }
                });
            }
        }
    }
</script>

<style scoped>
    .box-card {
        width: 250px;
    }

    .item {
        padding: 10px 0;
    }

    .text {
        font-size: 14px;
    }
</style>
