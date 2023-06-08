import React, { useMemo } from 'react';
import { useSafeState } from 'ahooks';
import { cloneDeep, mapValues, pickBy } from 'lodash'
import type { OptionProps } from 'rc-select/lib/Option';

import type { FormItemProps } from './FormItemWrapper';
import FormItemWrapper from './FormItemWrapper';
import type { SelectProps } from './StateSelect';
import StateSelect from './StateSelect';
import { FormInstance } from 'antd/lib/form';

// 回调函数入参定义
interface transFuncParamsProps {
  selected: number | string | number[] | string[]; // select多选时入参为数组
  selectedOptions?: object;
}

// 选项类型
type optionType = {
  label: string | number;
  value: string | number;
};

// 回调函数类型
type transFunc = (params: transFuncParamsProps) => object;

// 全量配置属性
type selectConfProps = {
  /** Select组件配置 */
  action?: string; // 接口
  method: 'GET' | 'POST';
  inParams?: object; // 固定入参处理
  transInParams?: transFunc; // 入参由上一级的选中值决定
  request?: (
    action: string | undefined,
    payload: object,
    option?: object,
  ) => Promise<any>; // 接口请求方法
  requestCallbackTrans?: (
    result: object | number | string | null,
  ) => OptionProps;
  disabled?: boolean;
  fieldProps?: SelectProps; // select组件props, 此处设置disabled优先级高于单独设置disabled
  options?: optionType[]; // 不采用接口情况
  /** Form.Item 配置 */
  name?: string; // 表单name
  label?: string; // 表单label
  required?: boolean; // 是否必填
  requiredMessage?:
    | string
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | undefined; // 必填提示文案
  formItemProps?: FormItemProps; // 表单Item props，此处rules设置required属性不能覆盖required属性; 任何一处设置true则必填;
};

// 组件props定义
export interface SplitedCascaderProps {
  children?: React.ReactNode;
  useInForm: boolean; // 是否在表单中使用
  form?: FormInstance;
  formRef?: React.RefObject<any>;  // todo: 待测试 类型是否可用
  // actionsList?: string[]; // 接口列表，用于调用每一级的结果；
  // // actionsResponseKeysList?: keyType[]; // 接口返参中的labelKey, valueKey
  // levelOptionsList?: object[][]; // 每一级的下拉选项， 传入时则actionsList不生效
  // transLevelParamsList?: object[] | transFunc[];  // 传递到每一级的参数， 可写固定值object， 或者回调函数形式，入参为上一级选择的值
  // requiredList?: boolean[] | boolean; // 每一项是否必填, 快速配置每项是否必填
  // disabledList?: boolean[] | boolean; // 每一项是否禁用，快速配置每项是否禁用
  // fieldsPropsList?: SelectProps[];  // 每一项Select额外的props
  // formItemPropsList?: FormItemProps[]; // 每一个FormItem的额外props
  initValue: object; // { name1: initValue1 } 设置初始值，用于回显
  confList?: selectConfProps[]; // 全量配置, 如果配置了， 以此配置为准; 优先级最高。
}

const SplitedCascader = (props: SplitedCascaderProps): React.ReactNode => {
  const {
    useInForm = false,
    // actionsList,
    // actionsResponseKeysList,
    // levelOptionsList,
    // transLevelParamsList,
    // requiredList,
    // disabledList,
    // fieldsPropsList,
    // formItemPropsList,
    confList = [],
    initValue = {},
  } = props || {};
  
  const [valueMap, setValueMap] = useSafeState<any>({});

  if (confList?.length > 0) {
    return (
      <>
        {confList.map(
          (
            {
              // 非受控
              action,
              method,
              inParams,
              transInParams,
              request, // 接口请求方法
              requestCallbackTrans,
              // labelKey = 'name', // todo: 瞎写的两个key
              // valueKey = 'value',
              // 受控
              disabled,
              fieldProps,
              options,
              /** Form.Item 配置 */
              name,
              label,
              required,
              requiredMessage,
              formItemProps,
            },
            index,
          ) => {
            const { onChange } = fieldProps || {};

            // 处理组件值变化
            const handleChange = (value: any, option: any): void => {
              onChange?.(value, option);
              console.log('handleChange----->', value, option);
              const newValueMap = pickBy(valueMap, (value, key)=> Number(key) < index );
              newValueMap[index] = { value, option };
              
              setValueMap(newValueMap);

              // todo: form rest index大于当前index的表单项
            };

            // 监听上一级变化
            const transParams = useMemo(() => {
              if (transInParams && index >= 1) {
                console.log(
                  '??????->>>>',
                  transInParams,
                  valueMap,
                  transParams,
                );

                return transInParams(valueMap[index - 1]?.value);
              }

              return {};
            }, [transInParams, valueMap]);
            
            
            // TODO: 1. 上一级变化时， 之后的所有级的值清空
            // TODO: 2. 用于表单内时逻辑--form内的值同步改变。
            // TODO: 3. 回显编辑逻辑完善。

            return (
              <FormItemWrapper
                useInForm={useInForm}
                key={index}
                name={name}
                label={label}
                required={required}
                requiredMessage={requiredMessage}
                {...formItemProps}
              >
                <StateSelect
                  key={index}
                  value={valueMap[index]?.value}
                  onChange={handleChange}
                  style={{ width: 200 }}
                  options={options}
                  disabled={disabled}
                  action={action}
                  request={request}
                  requestCallbackTrans={requestCallbackTrans}
                  method={method}
                  params={inParams ? inParams : transParams}
                  {...fieldProps}
                />
              </FormItemWrapper>
            );
          },
        )}
      </>
    );
  }

  return <>nonono</>;
};

export default SplitedCascader as React.FC;
