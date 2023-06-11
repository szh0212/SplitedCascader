import { Select } from 'antd';
import React, { useEffect } from 'react';
import { SelectProps as SltProps } from 'antd/es/select';
import type { OptionProps } from 'rc-select/lib/Option';
import { useSafeState } from 'ahooks';

interface ParamsType extends Object {
  shouldUpdate: boolean;
}

export interface SelectProps extends SltProps {
  children?: React.ReactNode;
  action?: string; // 接口
  method?: 'GET' | 'POST';
  request?: (
    action: string | undefined,
    payload: object,
    option?: object,
  ) => Promise<any>; // 接口请求方法
  transRequestOutParamsToOptions?: (
    result: object | number | string | null,
  ) => OptionProps | any;
  params?: ParamsType;
}

const StateSelect = (props: SelectProps): React.ReactNode => {
  const {
    params,
    request,
    transRequestOutParamsToOptions,
    method,
    action,
    options,
    ...restProps
  } = props || {};
  const [thisOptions, setThisOptions] = useSafeState<any[]>([]);
  const { shouldUpdate = false, ...realParams } = params;

  useEffect(() => {
    if ((options && options.length > 0) || !shouldUpdate) {
      return;
    }
    if (request && action) {
      request?.(action, realParams || {}, { method }).then((res: any) => {
        const nOptions = transRequestOutParamsToOptions?.(res) || [];

        setThisOptions(nOptions);
      });
    }
  }, [params]);

  return <Select options={options || thisOptions} {...restProps} />;
};

export default StateSelect as React.FC;
