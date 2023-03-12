import React, {FC, ReactNode, useEffect, useState} from 'react';
import {Button, Col, Form, InputNumber, Layout, Row, Table, Typography} from 'antd';
import './App.css';

import {ColumnsType} from "antd/lib/table";

interface Arg {
    name: string,
    range: number[],
    discret: number
    discretView?: string
    value?: number
}

const App: FC = function () {

    const [calcResult, setCalcResult] = useState<string | undefined>()
    const tableInitValues: Arg[] =
        [
            {
                name: 'a',
                range: [0.01, 1.01],
                discret: 0.01
            },
            {
                name: 'b',
                range: [1, 314],
                discret: 3.14,
                discretView: 'π'
            },
            {
                name: 'c',
                range: [18, 20],
                discret: 0.4
            },
            {
                name: 'd',
                range: [Math.sqrt(2), 3.1],
                discret: 0.02
            },
            {
                name: 'f',
                range: [0.0, 0.4],
                discret: 0.001
            },
            {
                name: 'x',
                range: [Math.pow(3, 1 / 3)],
                discret: 0
            },
        ]
    const [currentValues, setCurrentValues] = useState(
        Object.assign({}, ...(
            tableInitValues.map((value) => {
                if (value.value === undefined) {
                    value.value = value.range[0]
                }
                return {name: value.name, value: value.value}
            }).map(
                val => ({[val.name]: val.value})
            )
        ))
    )

    useEffect(() => {
        console.log(currentValues)
    }, [currentValues])

    const [form] = Form.useForm();
    const formItemLayout = {
        labelCol: {
            xs: {span: 24},
            sm: {span: 8},
        },
        wrapperCol: {
            xs: {span: 24},
            sm: {span: 16},
        },
    };
    const columns: ColumnsType<Arg> = [
        {
            title: 'Название аргумента',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Диапозон аргумента',
            dataIndex: 'range',
            key: 'range',
            render: (value) => {
                if (value instanceof Array) {
                    if (value.length > 1) {
                        return `[${value[0]}, ${value[value.length - 1]}]`;
                    } else if (value.length === 1) {
                        return `const ${value[0]}`
                    } else {
                        return 'Неизвестный диапозон.'
                    }
                }
                return value
            }
        },
        {
            title: 'Дискрет аргумента',
            dataIndex: 'discret',
            key: 'discret',
            render: (value, currnetArg, index) => {
                if (currnetArg.discretView) {
                    return currnetArg.discretView
                }
                if (value === 0) {
                    return 'Константа ' + (
                        currnetArg.range[currnetArg.range.length - 1])
                }
                return value.toString()
            }
        }
    ]
    const tailLayout = {
        wrapperCol: {offset: 0, span: 1},
        labelCol: {offset: 1, span: 0}
    };
    const renderForm = (): ReactNode[] => {

        return tableInitValues.map((value, index, array) => {
            if (value.value === undefined) {
                value.value = value.range[0]
            }
            const fn = (val1: string | undefined, info?: any): string => {
                let val = val1 && parseFloat(val1)
                console.log(val)
                if (val === undefined) {
                    return '0'
                }
                let lastValid = value.range[0]
                let valid = false;

                while (lastValid <= val) {
                    if (lastValid === val) {
                        valid = true;
                        break;
                    } else {
                        lastValid += value.discret
                    }
                }
                if (valid) {
                    console.log('valid')
                    currentValues[value.name] = val;
                    //setCurrentValues(Object.assign({}, currentValues, {[value.name]: val}))
                    return val.toString()
                }
                console.log('invalid')
                currentValues[value.name] = lastValid;
                //setCurrentValues(Object.assign({}, currentValues, {[value.name]: lastValid}))
                return (parseFloat(lastValid.toFixed(10))).toString()

            }
            return (<>
                <>
                    <Form.Item labelAlign={'right'}
                               name={value.name}
                               label={value.name}
                               key={value.name}
                               initialValue={value.value}
                               {...tailLayout}
                    >

                        <InputNumber min={value.range[0].toString()}
                                     max={value.range[value.range.length - 1].toString()}
                                     disabled={value.range.length === 1}
                                     step={value.discret}
                                     value={currentValues[value.name]}
                                     parser={fn}
                                     formatter={fn}
                                     onChange={(v) => {
                                         let val = parseFloat(v)
                                         if (val === undefined) {
                                             return
                                         }
                                         console.log(val)

                                         let lastValid = value.range[0]
                                         let valid = false;

                                         while (lastValid <= val) {
                                             if (lastValid === val) {
                                                 valid = true;
                                                 break;
                                             } else {
                                                 lastValid += value.discret
                                             }
                                         }
                                         if (valid) {
                                             currentValues[value.name] = val;
                                             setCurrentValues(Object.assign({}, currentValues, {[value.name]: val}))
                                         }
                                         currentValues[value.name] = lastValid;
                                         setCurrentValues(Object.assign({}, currentValues, {[value.name]: lastValid}))
                                     }}
                        />
                    </Form.Item>
                </>
            </>)
        })
    }
    return <div className="App">
        <Layout>
            <Typography.Title level={3}>Программа вычислений функции.</Typography.Title>
            <div><Typography.Title level={4} type={'secondary'}>Таблица значений.</Typography.Title></div>
            <Row>
                <Col offset={4} md={16}>
                    <Table dataSource={tableInitValues} columns={columns} pagination={false}/>
                </Col>
            </Row>
            <Row>
                <Col offset={5} md={2}>
                    <Form {...formItemLayout} form={form}

                          name={'calculationForm'}
                          onFinish={(values) => {
                              // @ts-ignore
                              let n = (({a, b, c, d, f, x}) => {
                                  return `(${a}*${x}*${x} + (${b}*${x}) + ${c})/(${d}*${x}+${f})`
                              })(values)
                              // eslint-disable-next-line no-eval
                              //console.log(eval(n))
                              // eslint-disable-next-line no-eval
                              setCalcResult(n + ' = ' + eval(n))

                          }}>
                        {renderForm()}
                        <Button htmlType={'submit'} onClick={() => {
                        }}>Посчитать</Button>
                    </Form>
                </Col>
                <Col offset={1}>
                    <h2 style={{marginTop: 100}}>При вводе неверного значения, <br/>значение будет округлено до
                        соответствующего аргументу.</h2>
                </Col>
            </Row>

        </Layout>
        <div className={'calcResult'} style={{fontSize: 24}}>{calcResult}</div>
    </div>
};

export default App;
