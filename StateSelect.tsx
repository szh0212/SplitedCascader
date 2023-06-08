import { Select } from 'antd';
import React, { useEffect } from 'react';
import { SelectProps as SltProps } from 'antd/es/select';
import type { OptionProps } from 'rc-select/lib/Option';
import { useSafeState } from 'ahooks';

export interface SelectProps extends SltProps {
  children?: React.ReactNode;
  action?: string; // 接口
  method?: 'GET' | 'POST';
  request?: (
    action: string | undefined,
    payload: object,
    option?: object,
  ) => Promise<any>; // 接口请求方法
  requestCallbackTrans?: (result: object | number | string | null) => OptionProps | any;
  params?: object;
}

const StateSelect = (props: SelectProps): React.ReactNode => {
  const { params, request,requestCallbackTrans, method, action, options, ...restProps } =
    props || {};
  const [thisOptions, setThisOptions] = useSafeState<any[]>([]);

  useEffect(() => {
    if (options && options.length > 0) {
      return;
    }
    if (request && action) {
      request?.(action, params || {}, { method }).then((res:any) => {
        const nOptions = requestCallbackTrans?.(res) || []

        console.log(77777,params,nOptions)
        setThisOptions(nOptions);
      });
    }
  }, [params]);

  return <Select options={options || thisOptions} {...restProps} />;
};

export default StateSelect as React.FC;
