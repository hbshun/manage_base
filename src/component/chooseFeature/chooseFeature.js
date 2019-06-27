const chooseFeature = {}

chooseFeature.a = function() {
  console.log('success')
}
chooseFeature.b = {
  c: function() {
    console.log('show  c')
  }
}

module.exports = chooseFeature
