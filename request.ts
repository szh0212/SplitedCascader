const getOptions = (num) => {
  console.log('this is num----->', num);
  if (num === 2) {
    return [
      {
        label: 1,
        value: 1,
      },
      {
        label: 2,
        value: 2,
      },
    ];
  }

  if (num === 3) {
    return [
      {
        label: 1,
        value: 1,
      },
      {
        label: 2,
        value: 2,
      },
      {
        label: 3,
        value: 3,
      },
    ];
  }

  if (num === 4) {
    return [
      {
        label: 1,
        value: 1,
      },
      {
        label: 2,
        value: 2,
      },
      {
        label: 3,
        value: 1,
      },
      {
        label: 4,
        value: 4,
      },
    ];
  }
  return [];
};
//  new Array(num)
//     .fill(0)
//     .map((_, index) => ({
//       // label:`${num}_${index}`,
//       // value:`${num}_${index}`
//       label: `${num}_${index + 1}`,
//       value: num + index + 1,
//     }));

export const requests = (action, { value, option }, options) => {
  const data = getOptions(value);
  console.log('requests----->', action, value, options, data);
  return Promise.resolve({
    data: data,
  });
};
