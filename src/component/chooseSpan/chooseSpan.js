const constant = require('../../config/constant.js')

const chooseSpan = {
  data: {},

  changeShowHideType: function(e) {
    // let tab = lodash.clone(this.data.tab);
    let tab = this.data.tab
    for (let i = 0; i < tab.filters.length; i++) {
      if (tab.filters[i].name == e.target.dataset.name) {
        if (tab.filters[i].showHideType == 2) {
          tab.filters[i].showHideType = 1
        } else {
          tab.filters[i].showHideType = 2
        }
      }
    }

    this.setData({
      tab
    })
  }
}

module.exports = chooseSpan
