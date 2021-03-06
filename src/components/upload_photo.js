import React from 'react';
import ModalInner from './modal';
import _ from 'lodash';
import {MODAL} from './constant';

export default React.createClass({

    getInitialState: function () {
        return {
            input: ''
        };
    },

    handleChange: _.partial((context, path, e) => {
        var value = e.target ? e.target.value : e,
            state = _.cloneDeep(context.state, true);
        _.set(state, path, value);
        context.setState({
            ...state
        });
    }),

    render: function () {
        var {input} = this.state,
            info = input.split(/\s+/g),
            title = info[1] || '',
            address = info[0] || '',
            config = {
                type: "text",
                value: input,
                className: "form-control",
                onChange: (e) => this.handleChange(this, 'input', e),
                placeholder: "http://example.com/images/diagram.jpg 标题"
            };

        return (<div>
                    <ModalInner>
                        <div>插入图片</div>
                        <div>
                            <div className="form-group photo-modal-inner">
                                <label>图片地址</label>
                                <input {...config} />
                            </div>
                            <button className="btn btn-primary pull-right mr30" onClick={() => {
                                this.props.onInsert(`\n![${title}](${address})\n`);
                                this.props.closeModal(MODAL.PHOTO);
                            }}>确定</button>
                        </div>
                    </ModalInner>
                </div>);
    }
});
