import Taro from '@tarojs/taro'
import constant from '../../../../config/constant.js'

const selectConfig = {
  data: {
    select: {
      show: false,
      num: 1
    },
    existProductLength: 0, // 存在商品的数量（如果为空显示售罄状态）
    existProductObj: {}, // 存在的商品（各种sku_options组合而成的单品，productId对应optionId）
    existProductObjInfo: {}, // 存在的商品信息（productId对应的product信息）
    optionsToFlag2DArr: [], // 当category有1个以上的时候，由行列组成的options2维数组，可以通过optionsToFlag2D[i][j]可以取到option的状态【0->不可点击，1->可点击，2->已经点击】。i表示第i个category，j表示1个category下第j个option
    optionsToOptionId2DArr: [], // 当category有1个以上的时候，由行列组成的options2维数组，可以通过optionsToFlag2D[i][j]可以取到option的【optionId】。i表示第i个category，j表示1个category下第j个option
    optionsNameObj: {}, // 把选项optionId 和选项名字联系起来的对象
    categoryNameArr: [], // 放着category名字,通过index获得，这里的index和optionsToFlag2DArr，optionsToOptionId2DArr的index通用。 optionsToFlag2D[i][j]的第一层index->i。
    selectedOptionsArr: [], // 当前目前已经选择的options
    checkOptionsArr: [], // 用来判断某一个option是否可以点击的数组，后面会有详细说明
    optionsCategoryIndex: {}, // 键：option的id，值：该option所在的category的index

    // 是否存在sku
    isSku: true
  },

  /**
   * 初始化选中项
   */
  initSelectedData: function(defaultProdCategory, skuOptions) {
    const optionsToOptionId2DArr = this.data.optionsToOptionId2DArr

    for (let i = 0; i < defaultProdCategory.length; i++) {
      // for (let i = 0; i < 2; i++) {
      const indexObj = this.returnIndex(
        defaultProdCategory[i].id,
        defaultProdCategory[i].value_id,
        skuOptions
      )

      this.data.selectedOptionsArr.push(
        optionsToOptionId2DArr[indexObj.categoryIndex][indexObj.optionIndex]
      )
      this.judgeSelectedLength()

      if (this.data.existProductLength > 0) {
        // 如果没有全部售罄，那么显示选择状态，否则全部不可选
        this.chooseOption()
      } else {
        Taro.showModal({
          title: '提示',
          content: '该商品已售罄',
          showCancel: false
        })
      }
    }
  },

  /**
   * 判断选择的选项是否每个category下的option都选了，如果都选了，“加入购物车”按钮变红
   */
  judgeSelectedLength: function() {
    const selectOptionLength = this.data.selectedOptionsArr.length
    const requestLength = this.data.optionsToOptionId2DArr.length
    let flag = false
    let currentProduct = this.data.currentProduct

    if (selectOptionLength == requestLength) {
      flag = true
      // 12.22加了一个‘ || this.data.currentProduct’因为商品售罄的时候会报错，setData会报错，临时补丁，之后会重构
      currentProduct = this.setCurrentProduct() || this.data.currentProduct
      // this.initPromotions(currentProduct);
      // this.reInitCurrentProduct();
    }

    this.setData({
      isSku: flag,
      currentProduct
    })
  },

  /**
   * 重新初始化当前的product（主要初始化活动、服务、焦点图）
   */
  reInitCurrentProduct: function() {
    let productData = this.data.productData
    let id = this.data.id
    let that = this
    const isFlashsale = this.data.isFlashsale

    productData.products.forEach(product => {
      if (product.id == id) {
        // 初始化轮播图

        for (let i = 0; i < product.images.length; i++) {
          let processImage = product.images[i].image
          if (util.needPrecssImage(processImage)) {
            processImage = processImage + constant.imageSuffix.productFocus
          }

          product.images[i].image = processImage
        }

        that.initSwiperImages(product.images)
        if (!isFlashsale) {
          // 初始化活动类型
          that.initPromotions(product)
          // 初始化服务
          that.initDialogService(productData.brand.service)
        }
        that.setData({
          currentProduct: product
        })
      }
    })
  },

  /**
   * 设置选择的product为当前product
   */
  setCurrentProduct: function() {
    const existProductObj = this.data.existProductObj
    const selectedOptionsArr = this.data.selectedOptionsArr
    let flag = false

    for (let i in existProductObj) {
      const existProductStr = existProductObj[i].toString()

      flag = selectedOptionsArr.every(function(value, index) {
        return existProductStr.indexOf(value) > -1
      })

      if (flag) {
        let currentProduct = this.data.existProductObjInfo[i]

        this.initSwiperImages(currentProduct.images)
        // 初始化活动类型(不用初始化服务，因为服务跟着品牌走)
        const isFlashsale = this.data.isFlashsale
        if (!isFlashsale) {
          // 初始化活动类型
          this.initPromotions(currentProduct)
        }
        return currentProduct
      }
    }
  },

  /**
   * 根据categoryId，optionId，skuOptions返回对应的该option在哪行哪列
   */
  returnIndex: function(categoryId, optionId, skuOptions) {
    const indexObj = {}

    for (let i = 0; i < skuOptions.length; i++) {
      if (skuOptions[i].id == categoryId) {
        indexObj.categoryIndex = i
      }

      for (let j = 0; j < skuOptions[i].values.length; j++) {
        if (skuOptions[i].values[j].id == optionId) {
          indexObj.optionIndex = j
        }
      }
    }

    return indexObj
  },

  /**
   * 点击某option，判断点击小标签的状态
   */
  clickSelectOption: function(e) {
    const categoryIndex = e.currentTarget.dataset.categoryIndex
    const optionIndex = e.currentTarget.dataset.optionIndex
    const status = this.data.optionsToFlag2DArr[categoryIndex][optionIndex]

    switch (status) {
      case 0:
        break
      case 1:
        //  直接点击可选择的按钮
        this.changeOption(categoryIndex, optionIndex)
        break

      case 2:
        // 点击选中的按钮取消选中
        this.cancelChosenOption(categoryIndex, optionIndex)
        break
    }
  },

  /**
   * 直接点击可选择的按钮（先判断在该category下有无被选定的option，如果有就交换）
   */
  changeOption: function(categoryIndex, optionIndex) {
    let selectedOptionsArr = this.data.selectedOptionsArr
    const optionId = this.data.optionsToOptionId2DArr[categoryIndex][
      optionIndex
    ]
    const optionsCategoryIndex = this.data.optionsCategoryIndex

    for (let i = 0; i < selectedOptionsArr.length; i++) {
      // 如果选项中有和点击的option同一个category下的option_,那么在选项中去掉option_,并且添加option
      if (optionsCategoryIndex[selectedOptionsArr[i]] == categoryIndex) {
        selectedOptionsArr.splice(i, 1)
      }
    }

    selectedOptionsArr.push(optionId)
    this.judgeSelectedLength()
    this.chooseOption()
  },

  /**
   * 点击选中的按钮取消选中
   */
  cancelChosenOption: function(categoryIndex, optionIndex) {
    let selectedOptionsArr = this.data.selectedOptionsArr
    const optionId = this.data.optionsToOptionId2DArr[categoryIndex][
      optionIndex
    ]
    for (let i = 0; i < selectedOptionsArr.length; i++) {
      if (selectedOptionsArr[i] == optionId) {
        selectedOptionsArr.splice(i, 1)
        this.judgeSelectedLength()
      }
    }

    this.chooseOption()
  },

  /**
   * 选择的option
   */
  chooseOption: function() {
    this.initOptionsToFlag2DArr()
    let optionsToOptionId2DArr = this.data.optionsToOptionId2DArr

    // 遍历optionsToOptionId2DArr二维数组，一个个option查询
    // 把已选择数组selectedOptionsArr复制给checkOptionsArr数组（因为不能直接动selectedOptionsArr里的数据）
    // 遍历到的option分为以下3种情况
    // 1、option 是已选择的（在checkOptionsArr里能找到option）
    // 2、option 所在的category下有被选择的option_(有可能option和option_是同一个),那么在checkOptionsArr中去掉option_，并添加option
    // 3、option 所在的category下没有被选择的option_,则直接在checkOptionsArr中添加option
    // 情况1跳过，情况2、3、进入到下一个步骤，遍历所有product，如果存在任何一个product，该product的组成options包含checkOptionsArr里的全部options，那么该option设置为可选择状态
    for (let i = 0; i < optionsToOptionId2DArr.length; i++) {
      let categoryItem = optionsToOptionId2DArr[i]

      for (let j = 0; j < categoryItem.length; j++) {
        let optionId = categoryItem[j]
        let checkOptionsArr = this.cloneArr(this.data.selectedOptionsArr)
        if (checkOptionsArr.indexOf(optionId) > -1) {
          // 情况1
          this.data.optionsToFlag2DArr[i][j] = 2
        } else {
          // 情况2、3,先得到新的checkOptionsArr，再用新的checkOptionsArr来遍历所有product
          let newCheckOptionsArr = this.returnNewCheckOptionsArr(
            optionId,
            checkOptionsArr
          )
          let flag = this.returnProductsIncludeCheckArr(newCheckOptionsArr)

          if (flag) {
            // 如果包含，则该option设为可选
            this.data.optionsToFlag2DArr[i][j] = 1
          }
        }
      }
    }

    const optionsToFlag2DArr = this.data.optionsToFlag2DArr
    this.setData({
      optionsToFlag2DArr
    })
  },

  /**
   * 初始化option显示
   */
  initOptionsToFlag2DArr: function() {
    let optionsToFlag2DArr = this.data.optionsToFlag2DArr
    for (let i = 0; i < optionsToFlag2DArr.length; i++) {
      for (let j = 0; j < optionsToFlag2DArr[i].length; j++) {
        optionsToFlag2DArr[i][j] = 0
      }
    }
    this.setData({
      optionsToFlag2DArr
    })
  },

  /**
   * 克隆，只能简单复制第一层
   */
  cloneArr: function(arr) {
    let newArr = []

    for (let i = 0; i < arr.length; i++) {
      newArr[i] = arr[i]
    }

    return newArr
  },

  /**
   * 根据option和其所在的category名下有无已选择的option返回新的待检测数组checkOptionsArr
   */
  returnNewCheckOptionsArr: function(optionId, checkOptionsArr) {
    let newCheckOptionsArr = this.cloneArr(checkOptionsArr)
    const optionsCategoryIndex = this.data.optionsCategoryIndex
    const categoryIndex = optionsCategoryIndex[optionId]

    for (let i = 0; i < newCheckOptionsArr.length; i++) {
      if (categoryIndex == optionsCategoryIndex[newCheckOptionsArr[i]]) {
        newCheckOptionsArr.splice(i, 1)
        break
      }
    }

    newCheckOptionsArr.push(optionId)

    return newCheckOptionsArr
  },

  /**
   * 返回是否现存的products包含checkOptionsArr所有项，如果只要有一个全包含返回true，都不包含返回false
   */
  returnProductsIncludeCheckArr: function(newCheckOptionsArr) {
    const existProductObj = this.data.existProductObj
    let flag = false // 某个product中是否包含所有的待检测数组newCheckOptionsArr所有项

    for (let i in existProductObj) {
      const existProductStr = existProductObj[i].toString()

      flag = newCheckOptionsArr.every(function(value, index) {
        return existProductStr.indexOf(value) > -1
      })

      if (flag) {
        return true
      }
    }

    return false
  },

  /**
   * 初始化选中项
   */
  // initSelectedData: function(currentProduct) {

  //   for(let i = 0; i < currentProduct.length; i++) {

  //     const categoryId = currentProduct[i].id;
  //     const optionId = currentProduct[i].value_id;

  //     this.data.selectedOptions.push(optionId);
  //     this.chooseOption(categoryId, optionId);
  //   }

  //   this.setData({

  //   });
  // },

  /**
   * 选择某一个option
   */
  // chooseOption: function (categoryId, optionId) {

  //   const { init, allOptionsData } = this.data;

  //   for( let key in allOptionsData) {

  //     if (key == categoryId) {

  //       if (init) {
  //         // 初始化第一个option（每个商品都有一个默认的product，里面由n个option组成）,因为一开始时候所有的option全为false，所以先设定categoryId下所有的optionId为可选状态
  //         this.data.init = false;
  //         this.optionsAllAble(allOptionsData[key]);
  //         this.func(categoryId);
  //       }
  //     } else {
  //       this.func(categoryId);
  //     }

  //     this.optionsChangeStatus();
  //   };
  // },

  /**
   * 设定options数组中所有项为可选择状态
   */
  // optionsAllAble: function (options) {

  //   let optionsStatus = this.data.optionsStatus;

  //   for( let i = 0; i < options.length; i++) {
  //     optionsStatus[options[i]] = true;
  //   }
  // },

  /**
   * 把所有待选option，符合条件的option的设为可选
   */
  // optionsChangeStatus:function() {

  //   let { selectedOptions } = this.data;

  // },

  /**
   * 根据点击的选项 把
   */
  // func: function (categoryId) {

  //   // const optionsArrIncategory = this.data.allOptionsData[categoryId]; //点击的选项所在的category下的options数组
  //   const selectedOptionsArr = this.data.selectedOptions;

  //   // 遍历所有存在的product数组，如果这个product包含所有已经选择的options项，那么这个product下剩余options的都设为可选
  //   for (let i in existProduct) {

  //     for ( let j = 0; j < existProduct[i].length; j++) {

  //       const productOptions = existProduct[i];
  //       const isExistProduct = this.returnIsExistProduct(productOptions);

  //       if(isExistProduct) {
  //         // 如果该product包含所有被选中的options，那么把product中所有的options都设为可点击状态
  //         this.optionsAllAble(productOptions);
  //       }
  //     }
  //   }

  // },

  /**
   * 返回这个product是不是 包含所有已经选择的options的选项的product
   */
  // returnIsExistProduct: function (productOptions) {

  //   const selectedOptions = selectedOptionsArr[k];

  //   // for (let k = 0; k < selectedOptionsArr.length; k++) {

  //   //   const selectedOption = selectedOptionsArr[k];

  //     let flag = selectedOptions.every(function (value) {
  //       return productOptions.indexOf(value) > -1;
  //     }, productOptions);

  //   // }

  //     console.log(flag);
  //     return flag;
  // },

  /**
   * 初始化选中项 - 本商品sku
   */
  // select_initSelectedData: function () {

  //   // 设置是否可选
  //   skus.forEach((sku) => {
  //     if (idx === 0) {
  //       // 第一层全部可选
  //       skuValue.status = 'show';
  //     }
  //     else {
  //       // 其他层次按照第一层设置显示状态

  //     }
  //   });

  // },

  /**
   * 点击 sku options 选择项
   */
  // handleSkuOptionsSelect: function (e) {

  //   const selectedData = e.target.dataset;

  //   // 点击不可选项时直接返回
  //   if (selectedData.disable) {
  //     return;
  //   }

  //   // 保存选择项
  //   this.addSelectedOption(selectedData);

  //   // 筛选可用sku
  //   this.searchSku();

  //   let { skuOptions, skuOptionsSelected, optionIdArr, productSkus } = this.data;

  //   // 设置状态
  //   if (skuOptionsSelected.length === 0) {
  //     skuOptions = this.regainSkuDefaultStatus();
  //   }
  //   else {
  //     this.setOptionsSelected();
  //   }

  //   // 是否存在 sku
  //   const isSku = this.hasSku();

  //   this.setData({
  //     skuOptions,
  //     isSku
  //   });

  // },

  /**
   * 是否存在 sku
   */
  // hasSku: function () {

  //   let { skuOptionsSelected, productSkus } = this.data;
  //   let that = this;

  //   let optionSelected = [], isSku = false;
  //   skuOptionsSelected.forEach((item) => {
  //     optionSelected.push(item.id);
  //   });

  //   optionSelected.sort((a, b) => {
  //     return a - b;
  //   });

  //   productSkus.forEach((item) => {
  //     if (item[optionSelected.join('-')]) {
  //       this.data.id = item[optionSelected.join('-')];
  //       that.initCurrentProduct();
  //       isSku = true;
  //     }
  //   });

  //   return isSku;

  // },

  /**
   * 筛选可用sku
   */
  // searchSku: function () {

  //   let { skus, skuOptionsSelected } = this.data;
  //   let hasSku, mySku, myskuSet = new Set();
  //   skus.forEach((sku) => {

  //     hasSku = true;
  //     mySku = sku;

  //     skuOptionsSelected.forEach((item) => {

  //       if (sku.indexOf(item.id) === -1) {
  //         hasSku = false;
  //       }

  //     });

  //     if (hasSku) {
  //       mySku.forEach((item) => {
  //         myskuSet.add(item);
  //       });
  //     }

  //   });

  //   this.data.optionIdArr = [...myskuSet];

  // },

  /**
   * 设置选择状态
   */
  // setOptionsSelected: function () {

  //   let { skuOptions, skuOptionsSelected, optionIdArr, skus } = this.data;
  //   let len = skuOptionsSelected.length;
  //   let isSelectedOption, selectedItem, hasId;
  //   let optionIdLen = optionIdArr.length, skuId;

  //   // 设置选项状态
  //   skuOptions.forEach((options) => {

  //     isSelectedOption = false;
  //     // 判断是否为选中组
  //     for (let i = 0; i < len; i++) {
  //       selectedItem = skuOptionsSelected[i];
  //       if (selectedItem.pid === options.id) {
  //         isSelectedOption = true;
  //         break;
  //       }
  //     }

  //     options.values.forEach((item) => {

  //       // 是选中组，点击项为选中状态，其他为不可点击状态
  //       if (isSelectedOption) {
  //         if (item.id === selectedItem.id) {
  //           item.status = 'selected';
  //         }
  //         else {
  //           item.status = 'disabled';
  //         }
  //       }
  //       // 不是选中组时，使用默认状态
  //       else {

  //         hasId = false;
  //         // 设置显示状态
  //         for (let i = 0; i < optionIdLen; i++) {

  //           skuId = optionIdArr[i];
  //           if (skuId === item.id) {
  //             hasId = true;
  //             break;
  //           }

  //         }

  //         if (!hasId) {
  //           item.status = 'disabled';
  //         }
  //         else {
  //           item.status = 'show';
  //         }

  //       }

  //     });

  //   });

  // },

  /**
   * 保存选择项
   */
  // addSelectedOption: function (selectedData) {

  //   let { skuOptionsSelected } = this.data;
  //   let len = skuOptionsSelected.length, i = 0, j = 0, item;
  //   let hasOption = false;

  //   // 判断当前选择的选项组是否已存在
  //   for (; i < len; i++) {
  //     item = skuOptionsSelected[i];
  //     // 使用 pid 判断是否已存在本组的选项
  //     if (item.pid === selectedData.pid) {
  //       hasOption = true;
  //       break;
  //     }
  //   }

  //   // 如果不存在，直接添加
  //   if (!hasOption) {
  //     skuOptionsSelected.push({
  //       id: selectedData.id,
  //       pid: selectedData.pid,
  //     });
  //   }
  //   // 存在的情况
  //   else {
  //     for (; j < len; j++) {
  //       item = skuOptionsSelected[j];
  //       // 如果存在此选项则删除
  //       if (item.id === selectedData.id) {
  //         skuOptionsSelected.splice(i, 1);
  //         break;
  //       }
  //       // 否则修改此选项组选中项值为点击的标签值
  //       else if (item.pid === selectedData.pid) {
  //         item.id = selectedData.id;
  //         break;
  //       }
  //     }
  //   }

  // },

  /**
   * 恢复选项的默认状态 - 是否可选
   */
  // regainSkuDefaultStatus: function () {

  //   let { skuOptions, optionIdArr } = this.data;
  //   let len = optionIdArr.length;

  //   // 设置选项状态
  //   skuOptions.forEach((options) => {

  //     options.values.forEach((item) => {

  //       let hasId = false;
  //       for (let i = 0; i < len; i++) {
  //         if (item.id === optionIdArr[i]) {
  //           hasId = true;
  //           break;
  //         }
  //       }
  //       if (hasId) {
  //         item.status = 'show';
  //       }
  //       else {
  //         item.status = 'disabled';
  //       }

  //     });

  //   });
  //   return skuOptions;

  // },

  /**
   * 关闭弹框
   */
  select_handleCloseSelect: function() {
    let select = this.data.select
    select.show = false
    this.setData({
      select
    })
  },

  /**
   * 显示弹框
   */
  select_handleShowSelect: function() {
    let select = this.data.select
    select.show = true
    this.setData({
      select
    })
  },

  /**
   * 数量减一
   */
  handleSkuSubtract: function() {
    let select = this.data.select
    let num = select.num
    num <= 1 ? 1 : num--
    select.num = num
    this.setData({
      select
    })
  },

  /**
   * 数量加一
   */
  handleSkuAdd: function() {
    let select = this.data.select
    let num = select.num
    let addToCartNum = constant.ADDTOCARTNUM

    if (num >= addToCartNum) {
      // 加入购物车的数量只能小于5
      num = addToCartNum
      Taro.showModal({
        title: '提示',
        content: '同一件商品加入购物车的数量不能多于5件',
        showCancel: false
      })
    } else {
      num++
    }
    select.num = num
    this.setData({
      select
    })
  },

  /**
   * 数量变化
   */
  handleNumChange: function(e) {
    let select = this.data.select
    let newNum = e.detail.value

    newNum = newNum <= 1 ? 1 : newNum
    select.num = newNum

    this.setData({
      select
    })
  },

  /**
   * 当前选择的sku显示大图
   */
  productPreviewImg: function() {
    const imgUrl = this.data.currentProduct.images[0].image
    Taro.previewImage({
      urls: [imgUrl]
    })
  }
}

export default selectConfig
