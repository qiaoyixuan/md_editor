import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import { Provider, connect } from 'react-redux'
import $ from 'jquery'

var md          = require('markdown-it')(),
    mdContainer = require('markdown-it-container');
var view_map, view_height = [];
md.core.ruler.at('replacements', function replace(state) {
    view_map = [];
    var tokens = state.tokens, n = 0, tmp_tokens = [];
    var divs = $('.block_text').children(), height = [], h = 0,
        _divs = $('.view')[0].children, _h = 0;
    console.log(divs, _divs)

    $(divs).each(function(idx, div){
        height.push(h);
        h += $(div).height();
    })
    for (var i = 0; i < _divs.length; i++) {
        // console.log(_divs[i])
        view_height.push(_h);
        _h += _divs[i].clientHeight;
    };
    console.log(height, view_height)
    for (var i = 0; i < tokens.length; i++) {
        tmp_tokens.push(tokens[i]);
        n += tokens[i].nesting;
        if(n == 0){
            var map_0 = tmp_tokens[0].map[0];
            // console.log(divs[map_0], $(divs[map_0]))
            view_map.push(height[map_0])
            tmp_tokens = [];
        }
    };
    // console.log('view_map', view_map)
});

var initial_state = {
	block_num : 0,
    block_text: [
        {
            id: 0,
            text: ''
        }
    ],
    view_text: '',
    editer_style: {
        height: window.innerHeight
    },
    edit_style: {
        height: window.innerHeight - 50
    },
    view_style: {
        height: window.innerHeight - 50
    }
}

function stateUtil (state = initial_state, action) {
    var ns = Object.assign({}, state);
    switch (action.type) {
        case 'insert_block':
            ns.block_text.push({id: ++ns.block_num, text: ''});
            return ns;
        case 'editing':
            ns.block_text[action.data.block_id].text = action.data.block_text;
            var text = ns.block_text.reduce(function(prev, cur){
               return prev += cur.text;
            }, '');
            ns.view_text = md.render(text);
            return ns;
        case 'handleResize':
            ns.editer_style.height = window.innerHeight;
            ns.edit_style.height = ns.view_style.height = window.innerHeight - 50;
            return ns;
        default:
        	return ns;
    }
}

var Editer = React.createClass({
    componentDidMount: function() {
        window.addEventListener('resize', this.props.handleResize);
    },
	render: function(){
        const {status, insert_block, editing, handleResize} = this.props;
		return (<div className='editer' style={{height:status.editer_style.height+'px'}}>
                    <div className='options'>
                        <button className='insert' onClick={insert_block}>newBlock</button>
                    </div>
					<Edit status={status} editing={editing}/>
					<View status={status} view_text={status.view_text}/>
				</div>)
	}
});

var Edit = React.createClass({
    componentDidMount: function(){
        var edit = ReactDOM.findDOMNode(this.refs.edit),
            children = $('.view')[0].children;
        edit.addEventListener('scroll', function(){
            for (var i = 0; i < view_map.length - 1; i++) {
                if(this.scrollTop > view_map[i] && this.scrollTop < view_map[i + 1])
                    // $('.container').animate({
                    //     scrollTop: view_map[i]
                    // }, 0)
                    // var per = (this.scrollTop - view_map[i]) / (view_map[i + 1] - view_map[i]);
                    // console.log(per)
                    // if(per)
                    $('.container').scrollTop(children[i].offsetTop);
            };
        });
    },
	render: function(){
        var self = this
        var blocks = this.props.status.block_text.map(function(block, i){
            return (<Block block_id={block.id} key={i} editing={self.props.editing}>{block.text}</Block>)
        })
		return (<div className='edit' ref='edit' style={{height:this.props.status.edit_style.height+'px'}}>
                    {blocks}
				</div>)
	}
});

var Block = React.createClass({
    render: function(){
        var self = this;
        function getVal(fn){
            return function(){
                fn(self.refs.textarea.getAttribute('data-block_id'), self.refs.textarea.innerText)
            }
        }
        return (<div className='block'>
                    <div className='block_edit' ref='textarea' contentEditable data-block_id={this.props.block_id} onInput={getVal(this.props.editing)} className='block_text'></div>
                </div>)
    }
})

var View = React.createClass({
	render: function(){
		return (<div className='container' style={{height:this.props.status.view_style.height+'px'}}>
                    <div className='view' ref='view' dangerouslySetInnerHTML={{ __html: this.props.view_text }}></div>
                </div>)
	}
});

function handleChange(){
    ///console.log('Current state:', store.getState());
}

var store = createStore(stateUtil),
	unsubscribe = store.subscribe(handleChange);

Editer.propTypes = {
    status: PropTypes.object,
    insert_block: PropTypes.func,
    handleResize: PropTypes.func
}

/* actions */
var insert_block = {
	type: 'insert_block'
}, editing = {
    type: 'editing',
    data: {
        block_id: null,
        block_text: null
    }
}, handleResize = {
    type: 'handleResize'
}

/* map */
function mapStateToProps(state){
    return {
        status: state
    }
}

function mapDispatchToProps(dispatch){
    return {
        insert_block: function(){
            dispatch(insert_block);
        },
        editing: function(block_id, text){
            editing.data.block_id = block_id;
            editing.data.block_text = text;
            dispatch(editing);
        },
        handleResize: function(){
            dispatch(handleResize);
        }
    }
}

var App = connect(mapStateToProps, mapDispatchToProps)(Editer)

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('editer')
)