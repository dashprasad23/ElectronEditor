const Store = require('electron-store');

const store = new Store();


const saveData = (key, data) => {
    store.set(key, data);
}

const getData = (key) => {
    return store.get(key)
}

const deleteData  = (key) => {
    return store.delete(key);
}


module.exports = {
    saveData,
    getData,
    deleteData
}

