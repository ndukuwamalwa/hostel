/* Handles success and error operations related to the database.*/

module.exports = class DBErrors {
    static insert(err, message = {}, render, res) {
        if (err === null) {
            render.data.errors = {
                type: 'success',
                message: `Record created successfully.`
            };
            return res.render(render.page, render.data);
        } else {
            let keys = Object.keys(message);
            if (err.sqlState === "23000") {
                if (err.errno === 1452) {
                    if (keys.length === 0) {
                        render.data.errors = {
                            type: 'error',
                            message: `Data relationship error. This may be due to inserting data that refers from 
                            another source.`
                        };
                        return res.render(render.page, render.data);
                    } else {
                        let key = keys.find(key => new RegExp(key, 'i').test(err.message));
                        if (key) {
                            render.data.errors = {
                                type: 'error',
                                message: `Fix the error: ${message[key]}`
                            };
                            return res.render(render.page, render.data);
                        } else {
                            render.data.errors = {
                                type: 'error',
                                message: `Failed to create record. Matching entries to an existing record were found.`
                            };
                            return res.render(render.page, render.data);
                        }
                    }
                } else {
                    if (keys.length === 0) {
                        render.data.errors = {
                            type: 'error',
                            message: `Failed to create record. Matching entries to an existing record were found.`
                        };
                        return res.render(render.page, render.data);
                    } else {
                        let key = keys.find(key => new RegExp(key, 'i').test(err.message));
                        if (key) {
                            render.data.errors = {
                                type: 'error',
                                message: `Fix the error: ${message[key]}`
                            };
                            return res.render(render.page, render.data);
                        } else {
                            render.data.errors = {
                                type: 'error',
                                message: `Failed to create record. Matching entries to an existing record were found.`
                            };
                            return res.render(render.page, render.data);
                        }
                    }
                }
            } else if (err.sqlState === "45000") {
                if (err.errno === 1644) {
                    render.data.errors = {
                        type: 'error',
                        message: err.message
                    };
                    return res.render(render.page, render.data);
                }
            }else if (err.sqlState === "22007"){
                if (err.errno === 1292) {
                    if (keys.length === 0) {
                        render.data.errors = {
                            type: 'error',
                            message: `Incorrect data format detected.`
                        };
                        return res.render(render.page, render.data);
                    } else {
                        let key = keys.find(key => new RegExp(key, 'i').test(err.message));
                        if (key) {
                            render.data.errors = {
                                type: 'error',
                                message: `Fix the error: ${message[key]}`
                            };
                            return res.render(render.page, render.data);
                        }
                    }
                } else {
                    if (keys.length === 0) {
                        render.data.errors = {
                            type: 'error',
                            message: `Failed to create record. There is a problem with the submitted data.`
                        };
                        return res.render(render.page, render.data);
                    } else {
                        let key = keys.find(key => new RegExp(key, 'i').test(err.message));
                        if (key) {
                            render.data.errors = {
                                type: 'error',
                                message: `Fix the error: ${message[key]}`
                            };
                            return res.render(render.page, render.data);
                        }
                    }
                }
            }else {
                render.data.errors = {
                    type: 'error',
                    message: `Failed to add new record. Please try again`
                };
                return res.render(render.page, render.data);
            }
        }
    }

    static update(err, result, message, render, res) {
        if (err === null) {
            let changed = result.changedRows;
            if (changed === 0) {
                render.data.errors = {
                    type: 'success',
                    message: `No changes made.`
                };
                return res.render(render.page, render.data);
            } else {
                render.data.errors = {
                    type: 'success',
                    message: `Updated successfully. ${changed} record(s) matched.`
                };
                return res.render(render.page, render.data);
            }
        } else {
            let keys = Object.keys(message);
            if (err.sqlState === "23000") {
                if (err.errno === 1452) {
                    if (keys.length === 0) {
                        render.data.errors = {
                            type: 'error',
                            message: `Data relationship error. This may be due to updating data that refers from another source.`
                        };
                        return res.render(render.page, render.data);
                    } else {
                        let key = keys.find(key => new RegExp(key, 'i').test(err.message));
                        if (key) {
                            render.data.errors = {
                                type: 'error',
                                message: `Fix the error: ${message[key]}`
                            };
                            return res.render(render.page, render.data);
                        }
                    }
                } else if (err.errno === 1062) {
                    if (keys.length === 0) {
                        render.data.errors = {
                            type: 'error',
                            message: `Failed to update record. Matching entries to an existing record were found.`
                        };
                        return res.render(render.page, render.data);
                    } else {
                        let key = keys.find(key => new RegExp(key, 'i').test(err.message));
                        if (key) {
                            render.data.errors = {
                                type: 'error',
                                message: `Fix the error: ${message[key]}`
                            };
                            return res.render(render.page, render.data);
                        }
                    }
                } else {
                    render.data.errors = {
                        type: 'error',
                        message: `Failed to update record. Please try again.`
                    };
                    return res.render(render.page, render.data);
                }
            } else if (err.sqlState === "45000") {
                if (err.errno === 1644) {
                    render.data.errors = {
                        type: 'error',
                        message: err.message
                    };
                    return res.render(render.page, render.data);
                }
            }else if (err.sqlState === "22007"){
                if (err.errno === 1292) {
                    if (keys.length === 0) {
                        render.data.errors = {
                            type: 'error',
                            message: `Incorrect data format detected.`
                        };
                        return res.render(render.page, render.data);
                    } else {
                        let key = keys.find(key => new RegExp(key, 'i').test(err.message));
                        if (key) {
                            render.data.errors = {
                                type: 'error',
                                message: `Fix the error: ${message[key]}`
                            };
                            return res.render(render.page, render.data);
                        }
                    }
                } else {
                    if (keys.length === 0) {
                        render.data.errors = {
                            type: 'error',
                            message: `Failed to update record. There is a problem with the submitted data.`
                        };
                        return res.render(render.page, render.data);
                    } else {
                        let key = keys.find(key => new RegExp(key, 'i').test(err.message));
                        if (key) {
                            render.data.errors = {
                                type: 'error',
                                message: `Fix the error: ${message[key]}`
                            };
                            return res.render(render.page, render.data);
                        }
                    }
                }
            }else {
                render.data.errors = {
                    type: 'error',
                    message: `Failed to update record. Please try again.`
                };
                return res.render(render.page, render.data);
            }
        }
    }

    static delete(err, result, render, res) {
        if (err === null) {
            let affected = result.affectedRows;
            if (affected === 0) {
                render.data.errors = {
                    type: 'success',
                    message: `No records matched to delete.`
                };
                return res.render(render.page, render.data);
            } else {
                render.data.errors = {
                    type: 'success',
                    message: `Deleted successfully. ${affected} record(s) matched.`
                };
                return res.render(render.page, render.data);
            }
        } else {
            if (err.sqlState === "23000") {
                if (err.errno === 1451) {
                    render.data.errors = {
                        type: 'error',
                        message: `Data relationship error. Found other records that depend on this record.`
                    };
                    return res.render(render.page, render.data);
                } else {
                    render.data.errors = {
                        type: 'error',
                        message: `Failed to delete record. Please try again.`
                    };
                    return res.render(render.page, render.data);
                }
            } else {
                render.data.errors = {
                    type: 'error',
                    message: `Failed to delete record. Please try again.`
                };
                return res.render(render.page, render.data);
            }
        }
    }
}