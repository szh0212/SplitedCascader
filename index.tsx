import SplitedCascader from './SplitedCascader';
import { requests } from './request';

export default () => (
  <SplitedCascader
    confList={[
      {
        action: '/a',
        method: 'GET',
        inParams: { value: 2, option: [] },
        request: requests,
        // TODO: requestCallbackTrans 太难用， 很容易出错
        requestCallbackTrans: (res) => {
          if (res.data) {
            return res.data.map((i) => ({
              ...i,
              label: i.label,
              value: i.value,
            }));
          }

          return [];
        },
      },
      {
        action: '/b',
        method: 'POST',
        // inParams: { value: 2, option: [] },
        transInParams: (value) => {
          console.log("transInParams----->", value)
          return { value: value + 1, option: [] };
        },
        request: requests,
        requestCallbackTrans: (res) => {
          if (res.data) {
            return res.data.map((i) => ({
              ...i,
              label: i.label,
              value: i.value,
            }));
          }

          return [];
        },
      },
      {
        action: '/c',
        method: 'POST',
        // disabled: true,
        // TODO: 这个也不是很好用，不好排查错误
        transInParams: (value) => {
          console.log('transInParams----->', value);
          return { value: value + 1, option: [] };
        },
        request: requests,
        requestCallbackTrans: (res) => {
          if (res.data) {
            return res.data.map((i) => ({
              ...i,
              label: i.label,
              value: i.value,
            }));
          }

          return [];
        },
      },
    ]}
  />
);
