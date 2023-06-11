import { Form } from 'antd';
import SplitedCascader from './SplitedCascader';
import { requests } from './request';

const Demo = () => {
  const [form] = Form.useForm();

  return <Form form={form}>
    <SplitedCascader
      form={form}
      useInForm
      confList={[
        {
          action: '/a',
          method: 'GET',
          name: 'lv1',
          label: 'lv1',
          inParams: { value: 2, option: [] },
          request: requests,
          // TODO: transRequestOutParamsToOptions 太难用， 很容易出错
          transRequestOutParamsToOptions: (res) => {
            if (res.data) {
              return res.data.map((i) => ({
                ...i,
                label: i.label,
                value: i.value,
              }));
            }

            return [];
          },
          fieldProps: {
            style: { marginRight: 20, width: 200 },
          },
          formItemProps: {
            initialValue: 9999,
          },
        },
        {
          action: '/b',
          method: 'POST',
          name: 'lv2',
          label: 'lv2',
          // inParams: { value: 2, option: [] },
          transRequestInParams: (value) => {
            console.log('transRequestInParams----->', value);
            return { value: value + 1, option: [] };
          },
          request: requests,
          transRequestOutParamsToOptions: (res) => {
            if (res.data) {
              return res.data.map((i) => ({
                ...i,
                label: i.label,
                value: i.value,
              }));
            }

            return [];
          },
          fieldProps: {
            style: { marginRight: 20, width: 200 },
          },
        },
        {
          action: '/c',
          method: 'POST',
          name: 'lv3',
          label: 'lv3',
          // disabled: true,
          // TODO: 这个也不是很好用，不好排查错误
          transRequestInParams: (value) => {
            console.log('transRequestInParams----->', value);
            return { value: value + 1, option: [] };
          },
          request: requests,
          transRequestOutParamsToOptions: (res) => {
            if (res.data) {
              return res.data.map((i) => ({
                ...i,
                label: i.label,
                value: i.value,
              }));
            }

            return [];
          },
          fieldProps: {
            style: { marginRight: 20, width: 200 },
          },
        },
      ]}
    />
  </Form>
};


export default Demo 