import React, { useState } from "react";

const INITIAL_MULTIPLE_MODE = 'multi';
const INITIAL_KEYBOARD_MODE = 'discountMode';
const INITIAL_ARR = [
  {
    ID: 'CM1',
    name: 'item1',
    price: 100,
    amount: 1,
    discount: '',
    total: 100
  },
  {
    ID: 'CM2',
    name: 'item2',
    price: 200,
    amount: 1,
    discount: '',
    total: 200
  },
  {
    ID: 'CM3',
    name: 'item3',
    price: 300,
    amount: 1,
    discount: '',
    total: 300
  },
  {
    ID: 'CM4',
    name: 'item4',
    price: 400,
    amount: 1,
    discount: '',
    total: 400
  },
];

function App() {

  const [comms, setComms] = useState(INITIAL_ARR);
  const [selectedIds, setSelectedIds] = useState([]);
  const [uniformContent, setUniformContent] = useState('');
  const [keyboardMode, setKeyboardMode] = useState(INITIAL_KEYBOARD_MODE);
  const [multipleMode, setMultipleMode] = useState(INITIAL_MULTIPLE_MODE);

  const onAmountChange = (e, itemId) => {
    if (Number(e.target.value) < 1) return;
    onInputChange(e, itemId);
  };

  const onDiscountChange = (e, item) => {
    const discountMode = verifyDiscountString(e.target.value);
    if (!discountMode && e.target.value !== '') return;
    const discountAmount = convertDiscount(item, discountMode, e.target.value);
    if ( (item.price * item.amount) > discountAmount ) onInputChange(e, item.ID);
  };

  const onInputChange = (e, itemId) => {
    const processedComms = comms.map(comm => {
      return (comm.ID === itemId)
        ? calcCommTotal({ ...comm, [e.target.name]: e.target.value })
        : comm;
    });
    setComms(processedComms);
  };

  // When use Redux this can be as payload to edit item.
  const calcCommTotal = comm => {
    let total = comm.price * comm.amount;
    if ( comm.discount ) {
      const discountMode = verifyDiscountString(comm.discount);
      const discountAmount = convertDiscount(comm, discountMode, comm.discount);
      const discountMultiple = ( discountMode === 'percentage' || multipleMode === 'single' ) ? comm.amount : 1;
      total -= (discountAmount * discountMultiple);
    }
    return { ...comm, total };
  };

  const onInputClick = e => {
    setUniformContent('');
    setKeyboardMode(e.target.dataset.keyboardMode);
  };

  const onCommCheckboxClick = (e, itemId) => {
    e.target.checked
      ? setSelectedIds( [ ...selectedIds, itemId ])
      : setSelectedIds( selectedIds.filter( selectedId => selectedId !== itemId ));
    setUniformContent('');
  };

  const onKeyboardCheckboxClick = e => {
    setKeyboardMode(e.target.name);
  };

  const onMultipleCheckboxClick = e => {
    setMultipleMode(e.target.name);
  };

  const onUniformContentChange = (e, keyboardMode) => {
    if ( selectedIds.length <= 0 ) return alert('請先勾選商品');
    let newComms = [];
    switch (keyboardMode) {
      case 'discountMode':
        newComms = handelDiscountUnify(e);
        break;
      case 'amountMode':
        newComms = handleAmountUnify(e);
        break;
      default:
        newComms = [ ...comms ];
    };
    setComms(newComms);
  };

  const handelDiscountUnify = e => {
    const discountMode = verifyDiscountString(e.target.value);
    const newComms = [];
    let isDiscountExcess = false;
    comms.findIndex(comm => {
      if ( selectedIds.includes(comm.ID) ) {
        const discountAmount = convertDiscount(comm, discountMode, e.target.value);
        if ((comm.price * comm.amount) < discountAmount) {
          isDiscountExcess = true;
          return true }
        newComms.push(calcCommTotal({ ...comm, discount: e.target.value }));
        return false } 
      else {
        newComms.push(comm);
        return false;
      }
    });
    if ( isDiscountExcess ) { return comms } 
    else {
      setUniformContent(e.target.value);
      return newComms }
  };

  const handleAmountUnify = e => {
    setUniformContent(e.target.value);
    return comms.map(comm => {
      return selectedIds.includes(comm.ID)
        ? calcCommTotal({ ...comm, amount: Number(e.target.value) })
        : comm;
    })
  };

  const verifyDiscountString = (discountString) => {
    const percentTest = new RegExp('^\\d+%$').test(discountString);
    const amountTest = new RegExp('^\\d*\\d$').test(discountString);
    if (percentTest) return 'percentage';
    else if (amountTest) return 'constant'; 
    return '';
  };

  const convertDiscount = (comm, mode, discountString) => {
    let discountNum = 0;
    if ( mode === 'percentage' ) { discountNum = Number(discountString.slice(0, -1)) * comm.price / 100 }
    if ( mode === 'constant' ) { discountNum = Number(discountString) }

    return discountNum;
  };

  // Produce unique ID
  // const generateRandomId = (headerString = '') => {
  //   return headerString + 'yxxx'.replace(/[xy]/g, function(c) {
  //     const r = Math.random() * 16 | 0;
  //     const v = c === 'x' ? r : ((r & 0x3) | 0x8);
  //     return v.toString(16);
  //   });
  //   For test:
  //   Return Math.random() > 0.5 ? '12234' : 'temp25bc';
  // };

  // const getGuaranteedId = (IdGroupSource) => {
  //   let isRepeat = true;
  //   let newID = '';
  //   const existingIDs = IdGroupSource.map(order => order.ID);
  //   while(isRepeat) {
  //     newID = generateRandomId();
  //     isRepeat = existingIDs.includes(newID);
  //   }
  //   return newID;
  // };

  const renderedItems = (items = []) => {
    return items.map(item => {
      const selectedBg = selectedIds.includes(item.ID) ? '#eeeeee' : null ;

      return (
        <div key={item.ID} style={{ background: selectedBg }}>
          <input
            type="checkbox"
            checked={selectedIds.includes(item.ID)}
            onChange={e => onCommCheckboxClick(e, item.ID)}
          />
          <span>名稱:&nbsp; {item.name}</span>
          <span>單價:&nbsp;
            <span>{item.price}</span>
          </span>
          <span>數量:&nbsp;
            <input
              type="number"
              name="amount"
              data-keyboard-mode="amountMode"
              value={item.amount}
              onChange={e => onAmountChange(e, item.ID)}
              onClick={onInputClick}
            />
          </span>
          <span>折扣:&nbsp;
            <input
              type="text"
              name="discount"
              data-keyboard-mode="discountMode"
              value={item.discount}
              onClick={onInputClick}
              onChange={e => onDiscountChange(e, item)}
              autoComplete="off"
            />
          </span>
          <span>小計:&nbsp; {item.total}</span>
        </div>
      );
    })
  };
  
  console.log(comms);

  return (
    <div className="App">
      <div>
        {renderedItems(comms)}
      </div>

      <br />

      <div>
        <input
          type="checkbox"
          name="discountMode"
          checked={keyboardMode === 'discountMode'}
          onChange={onKeyboardCheckboxClick}
        />
        折扣
        <input
          type="checkbox"
          name="amountMode"
          checked={keyboardMode === 'amountMode'}
          onChange={onKeyboardCheckboxClick}
        />
        數量

        <input
          type="text"
          value={uniformContent}
          onChange={e => onUniformContentChange(e, keyboardMode)}/>
      </div>

      <br />

      <div>
        <input
          type="checkbox"
          name="multiple"
          checked={multipleMode === 'multi'}
          onChange={onMultipleCheckboxClick}
        />
        商品總和折價
        <input
          type="checkbox"
          name="single"
          checked={multipleMode === 'single'}
          onChange={onMultipleCheckboxClick}
        />
        商品單價折價
      </div>
      
    </div>
    
  );
}

export default App;
