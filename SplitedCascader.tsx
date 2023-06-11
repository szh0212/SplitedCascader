import React, { useMemo } from 'react';
import { useSafeState } from 'ahooks';
import { pickBy, zipObject } from 'lodash';
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
  transRequestOutParamsToOptions?: (
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
  form?: FormInstance; // 表单实例
  confList?: selectConfProps[]; // 全量配置, 如果配置了， 以此配置为准; 优先级最高。
}

const SplitedCascader = (props: SplitedCascaderProps): React.ReactNode => {
  const { useInForm = false, confList = [], form } = props || {};

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
              transInParams, // 接口入参处理
              request, // 接口请求方法
              transRequestOutParamsToOptions, // 接口返参处理
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
            const { onChange, value } = fieldProps || {};

            // 处理组件值变化
            const handleChange = (value: any, option: any): void => {
              // 不在表单内的正常处理
              onChange?.(value, option);
              const newValueMap = pickBy(
                valueMap,
                (value_, key) => Number(key) < index,
              );
              newValueMap[index] = { value, option };

              setValueMap(newValueMap);

              // 用于表单展示内时， form rest index大于当前index的表单项
              const nameList = confList.map((i) => i.name);
              const resetFieldsList = nameList.filter(
                (name_, idx) => idx > index,
              );

              form?.resetFields(resetFieldsList);
            };

            // 监听上一级变化
            const transParams = useMemo(() => {
              if (transInParams && index >= 1) {
                const lastLevelValue = valueMap[index - 1]?.value;

                // 使用shouldUpdate控制当前select是否应该调用接口， 此处控制上一级select值不为空才应该调用接口
                return {
                  shouldUpdate: lastLevelValue,
                  ...transInParams(lastLevelValue),
                };
              }

              return { shouldUpdate: false };
            }, [transInParams, valueMap[index - 1]?.value]);

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
                  value={value || valueMap[index]?.value}
                  onChange={handleChange}
                  options={options}
                  disabled={disabled}
                  action={action}
                  request={request}
                  transRequestOutParamsToOptions={transRequestOutParamsToOptions}
                  method={method}
                  params={
                    inParams ? { ...inParams, shouldUpdate: true } : transParams
                  }
                  placeholder="请选择"
                  {...fieldProps}
                />
              </FormItemWrapper>
            );
          },
        )}
      </>
    );
  }

  return null;
};

export default SplitedCascader as React.FC;
