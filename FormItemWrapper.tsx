import { Form } from 'antd';
import { FormItemProps as itemProps } from 'antd/lib/form';

const { Item } = Form;

export interface FormItemProps extends itemProps {
  defaultRequiredMessage?:
    | string
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | undefined;
  requiredMessage?:
    | string
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | undefined;
  useInForm?: boolean;
}

const FormItemWrapper = (props: FormItemProps): React.ReactElement => {
  const {
    required,
    requiredMessage,
    defaultRequiredMessage = '此项必填',
    rules = [],
    children,
    useInForm = true,
    ...restProps
  } = props || {};
  return useInForm ? (
    <Item
      rules={[
        {
          required,
          message: requiredMessage || defaultRequiredMessage,
        },
        ...rules,
      ]}
      {...restProps}
    >
      {children}
    </Item>
  ) : (
    <>{children}</>
  );
};

export default FormItemWrapper;
