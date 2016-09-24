module.exports = function(RED){
  RED.nodes.registerType('change', { color: "#E2D96E",
    category: 'function',
    defaults: {
      name: {value:""},
      rules:{value:[{t:"set",p:"payload",pt:"msg",to:"",tot:"str"}]},
      // legacy
      action: {value:""},
      property: {value:""},
      from: {value:""},
      to: {value:""},
      reg: {value:false}
    },
  inputs: 1,
  outputs: 1,
  faChar: "&#xf074;", //random
  label: function() {
      if (this.name) {
          return this.name;
      }
      if (!this.rules) {
          if (this.action === "replace") {
              return this._("change.label.set",{property:"msg."+this.property});
          } else if (this.action === "change") {
              return this._("change.label.change",{property:"msg."+this.property});
          } else if (this.action === "move") {
              return this._("change.label.move",{property:"msg."+this.property});
          } else {
              return this._("change.label.delete",{property:"msg."+this.property});
          }
      } else {
          if (this.rules.length == 1) {
              if (this.rules[0].t === "set") {
                  return this._("change.label.set",{property:(this.rules[0].pt||"msg")+"."+this.rules[0].p});
              } else if (this.rules[0].t === "change") {
                  return this._("change.label.change",{property:(this.rules[0].pt||"msg")+"."+this.rules[0].p});
              } else if (this.rules[0].t === "move") {
                  return this._("change.label.move",{property:(this.rules[0].pt||"msg")+"."+this.rules[0].p});
              } else {
                  return this._("change.label.delete",{property:(this.rules[0].pt||"msg")+"."+this.rules[0].p});
              }
          } else {
              return this._("change.label.changeCount",{count:this.rules.length});
          }
      }
  },
  labelStyle: function() {
      return this.name ? "node_label_italic" : "";
  },
  oneditprepare: function() {
      var set = this._("change.action.set");
      var change = this._("change.action.change");
      var del = this._("change.action.delete");
      var move = this._("change.action.move");
      var to = this._("change.action.to");
      var search = this._("change.action.search");
      var replace = this._("change.action.replace");
      var regex = this._("change.label.regex");

      function resizeRule(rule) {
          var newWidth = rule.width();
          rule.find('.red-ui-typedInput').typedInput("width",newWidth-150);

      }
      $('#node-input-rule-container').css('min-height','300px').css('min-width','450px').editableList({
          addItem: function(container,i,opt) {
              var rule = opt;
              if (!rule.hasOwnProperty('t')) {
                  rule = {t:"set",p:"payload",to:"",tot:"str"};
              }
              if (rule.t === "change" && rule.re) {
                  rule.fromt = 're';
                  delete rule.re;
              }
              if (rule.t === "set" && !rule.tot) {
                  if (rule.to.indexOf("msg.") === 0 && !rule.tot) {
                      rule.to = rule.to.substring(4);
                      rule.tot = "msg";
                  } else {
                      rule.tot = "str";
                  }
              }
              if (rule.t === "move" && !rule.tot) {
                  rule.tot = "msg";
              }

              var row1 = $('<div/>').appendTo(container);
              var row2 = $('<div/>',{style:"margin-top:8px;"}).appendTo(container);
              var row3 = $('<div/>',{style:"margin-top:8px;"}).appendTo(container);
              var row4 = $('<div/>',{style:"margin-top:8px;"}).appendTo(container);

              var selectField = $('<select/>',{class:"node-input-rule-type",style:"width:110px; margin-right:10px;"}).appendTo(row1);
              var selectOptions = [{v:"set",l:set},{v:"change",l:change},{v:"delete",l:del},{v:"move",l:move}];
              for (var i=0;i<4;i++) {
                  selectField.append($("<option></option>").val(selectOptions[i].v).text(selectOptions[i].l));
              }

              var propertyName = $('<input/>',{style:"width:250px",class:"node-input-rule-property-name",type:"text"})
                  .appendTo(row1)
                  .typedInput({types:['msg']});

              $('<div/>',{style:"display:inline-block;text-align:right; width:120px; padding-right:10px; box-sizing:border-box;"})
                  .text(to)
                  .appendTo(row2);
              var propertyValue = $('<input/>',{style:"width:250px",class:"node-input-rule-property-value",type:"text"})
                  .appendTo(row2)
                  .typedInput({default:'str',types:['msg','str','num','bool','json','date']});

              var row3_1 = $('<div/>').appendTo(row3);
              $('<div/>',{style:"display:inline-block;text-align:right; width:120px; padding-right:10px; box-sizing:border-box;"})
                  .text(search)
                  .appendTo(row3_1);
              var fromValue = $('<input/>',{style:"width:250px",class:"node-input-rule-property-search-value",type:"text"})
                  .appendTo(row3_1)
                  .typedInput({default:'str',types:['msg','str','re','num','bool']});

              var row3_2 = $('<div/>',{style:"margin-top:8px;"}).appendTo(row3);
              $('<div/>',{style:"display:inline-block;text-align:right; width:120px; padding-right:10px; box-sizing:border-box;"})
                  .text(replace)
                  .appendTo(row3_2);
              var toValue = $('<input/>',{style:"width:250px",class:"node-input-rule-property-replace-value",type:"text"})
                  .appendTo(row3_2)
                  .typedInput({default:'str',types:['msg','str','num','bool','json']});

              $('<div/>',{style:"display:inline-block;text-align:right; width:120px; padding-right:10px; box-sizing:border-box;"})
                  .text(to)
                  .appendTo(row4);
              var moveValue = $('<input/>',{style:"width:250px",class:"node-input-rule-property-move-value",type:"text"})
                  .appendTo(row4)
                  .typedInput({default:'msg',types:['msg']});

              selectField.change(function() {
                  var width = $("#node-input-rule-container").width();
                  var type = $(this).val();
                  if (type == "set") {
                      row2.show();
                      row3.hide();
                      row4.hide();
                  } else if (type == "change") {
                      row2.hide();
                      row3.show();
                      row4.hide();
                  } else if (type == "delete") {
                      row2.hide();
                      row3.hide();
                      row4.hide();
                  } else if (type == "move") {
                      row2.hide();
                      row3.hide();
                      row4.show();
                  }
                  resizeRule(container);
              });

              selectField.val(rule.t);
              propertyName.typedInput('value',rule.p);
              propertyName.typedInput('type',rule.pt);
              propertyValue.typedInput('value',rule.to);
              propertyValue.typedInput('type',rule.tot);
              moveValue.typedInput('value',rule.to);
              moveValue.typedInput('type',rule.tot);
              fromValue.typedInput('value',rule.from);
              fromValue.typedInput('type',rule.fromt);
              toValue.typedInput('value',rule.to);
              toValue.typedInput('type',rule.tot);
              selectField.change();

              var newWidth = $("#node-input-rule-container").width();
              resizeRule(container);
          },
          resizeItem: resizeRule,
          removable: true,
          sortable: true
      });

      if (!this.rules) {
          var rule = {
              t:(this.action=="replace"?"set":this.action),
              p:this.property,
              pt:"msg"
          }

          if ((rule.t === "set")||(rule.t === "move")) {
              rule.to = this.to;
          } else if (rule.t === "change") {
              rule.from = this.from;
              rule.to = this.to;
              rule.re = this.reg;
          }

          delete this.to;
          delete this.from;
          delete this.reg;
          delete this.action;
          delete this.property;

          this.rules = [rule];
      }

      for (var i=0;i<this.rules.length;i++) {
          var rule = this.rules[i];
          $("#node-input-rule-container").editableList('addItem',rule);
      }
  },
  oneditsave: function() {
      var rules = $("#node-input-rule-container").editableList('items');
      var ruleset;
      var node = this;
      node.rules= [];
      rules.each(function(i) {
          var rule = $(this);
          var type = rule.find(".node-input-rule-type").val();
          var r = {
              t:type,
              p:rule.find(".node-input-rule-property-name").typedInput('value'),
              pt:rule.find(".node-input-rule-property-name").typedInput('type')
          };
          if (type === "set") {
              r.to = rule.find(".node-input-rule-property-value").typedInput('value');
              r.tot = rule.find(".node-input-rule-property-value").typedInput('type');
          } else if (type === "move") {
              r.to = rule.find(".node-input-rule-property-move-value").typedInput('value');
              r.tot = rule.find(".node-input-rule-property-move-value").typedInput('type');
          } else if (type === "change") {
              r.from = rule.find(".node-input-rule-property-search-value").typedInput('value');
              r.fromt = rule.find(".node-input-rule-property-search-value").typedInput('type');
              r.to = rule.find(".node-input-rule-property-replace-value").typedInput('value');
              r.tot = rule.find(".node-input-rule-property-replace-value").typedInput('type');
          }
          node.rules.push(r);
      });
  },
  oneditresize: function(size) {
      var rows = $("#dialog-form>div:not(.node-input-rule-container-row)");
      var height = size.height;
      for (var i=0;i<rows.size();i++) {
          height -= $(rows[i]).outerHeight(true);
      }
      var editorRow = $("#dialog-form>div.node-input-rule-container-row");
      height -= (parseInt(editorRow.css("marginTop"),10)+parseInt(editorRow.css("marginBottom"),10));

      $("#node-input-rule-container").editableList('height',height);
  },
  render: function () {
    return (
      <div>
        <div className="form-row">
            <label htmlFor="node-input-name"><i className="fa fa-tag"></i> <span data-i18n="common.label.name"></span></label>
            <input type="text" id="node-input-name" data-i18n="[placeholder]common.label.name"/>
        </div>
        <div className="form-row" style={{ marginBottom: "0px" }}>
            <label><i className="fa fa-list"></i> <span data-i18n="change.label.rules"></span></label>
        </div>
        <div className="form-row node-input-rule-container-row">
            <ol id="node-input-rule-container"></ol>
        </div>
      </div>
    )
  },
    renderHelp: function () {
      return (
        <div>
          <p>Set, change or delete properties of a message.</p>
          <p>The node can specify multiple rules that will be applied to the message in turn.</p>
          <p>The available operations are:</p>
          <ul>
            <li><b>Set</b> - set a property. The <b>to</b> property can either be a string value, or reference
              another message property by name, for example: <code>msg.topic</code>.</li>
            <li><b>Change</b> - search &amp; replace parts of the property. If regular expressions
              are enabled, the <b>replace with</b> property can include capture groups, for example <code>$1</code></li>
            <li><b>Delete</b> - delete a property.</li>
          </ul>

        </div>
      )
    },
  renderDescription: () => <p>Set, change or delete properties of a message.</p>
  });
};
