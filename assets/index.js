function Validator (options) {

    const selectorRules = {};
    function getParentSelector (inputElement, selector) {
        while (inputElement.parentElement) {
            if (inputElement.parentElement.matches(selector)) {
                return inputElement.parentElement;
            }
            inputElement = inputElement.parentElement
        } 
    };
    // Ham thuc thi rule test
    function validate (inputElement, rule) {
        const errorMsgEle = getParentSelector (inputElement, options.parentSelector).querySelector(options.errorSelector);
        let errorMessage;
        const rules = selectorRules[rule.selector];
        // lap qua cac rule trong mang rules cua tung truong #selector da nhan duoc
        for (let i = 0; i < rules.length; ++i) {
            // truong hop the input co type la checkbox hoac radio
            switch (inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ":checked"))
                    break;

                default: 
                // gan errorMessage bang rule co loi
                errorMessage = rules[i](inputElement.value)
            }

            // neu phat hien loi thi dung vong lap
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorMsgEle.innerText = errorMessage;
            getParentSelector (inputElement, options.parentSelector).classList.add(options.errorStyleList)
        } else {
            errorMsgEle.innerText = "";
            getParentSelector (inputElement, options.parentSelector).classList.remove(options.errorStyleList)
        }
        return !errorMessage
    }
    // Cach lay value tu cac the input rieng biet
    const formElement = document.querySelector(options.form);

    //DOM event handler
    if (formElement) {
        options.rules.forEach(rule => {
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                // Luu cac key va gia tri cua cac rule vao object da tao, nhung cac rule truoc se bi ghi de boi rule sau cung
                selectorRules[rule.selector] = [rule.test]
            }
            const inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function(inputElement) {
                
                // Tra ket qua khi nguoi dung blur ra ngoai input Element
                    inputElement.onblur = function () {
                        validate (inputElement, rule)
                    }
                    // Bo message bao loi khi nguoi dung dang sua loi
                    inputElement.oninput = function () {
                        const errorMsgEle = getParentSelector (inputElement, options.parentSelector).querySelector(options.errorSelector)
                        errorMsgEle.innerText = "";
                        getParentSelector (inputElement, options.parentSelector).classList.remove(options.errorStyleList)
                    }
            })

        });
    }


    // Submit button handler
    if (formElement) {
        formElement.onsubmit = function (e) {
            let isSuccess = true;
            // Bo chuc nang default cua submit button trong form
            e.preventDefault();
            // Bao loi neu co truong du lieu chua dung
            options.rules.forEach(rule => {
                const inputElement = formElement.querySelector(rule.selector);
                const isValid = validate (inputElement, rule)
                if (!isValid) {
                    return isSuccess = false;
                }
            });
            if (isSuccess) {
                //submit voi option lua chon tu onSubmit function
                if(typeof options.onSubmit === 'function') {
                const inputNodelist = formElement.querySelectorAll("[name]");
                const inputElementArray = Array.from(inputNodelist);
                const inputValues = inputElementArray.reduce(function(values, input) {
                    console.log(input.name);
                const checkedElements = formElement.querySelectorAll("input[name='"+ input.name + "']:checked")
                    switch (input.type) {
                        case 'checkbox':
                            if (!checkedElements.length) {
                                values[input.name] = "";
                                return  values;
                            } else {
                                values[input.name] = [];
                                Array.from(checkedElements).forEach(checkedElement => {
                                    values[input.name].push(checkedElement.value);
                                });
                            }
                        break;

                        case 'radio':
                            values[input.name] = formElement.querySelector("input[name='"+ input.name + "']:checked").value;
                        break; 
                        case 'file':
                            values[input.name] = input.file;
                        break;
                        default: 
                            values[input.name] = input.value;
                    }
                    return values;
                    
                }, {});
                    options.onSubmit(inputValues)
                }
                //submit voi tinh nang default cua submit button html
                else {
                    formElement.submit()
                }
            }

        }
    }
}
Validator.isRequied =  function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            // value.trim() de loai bo khoang trong khi nguoi dung nhap phim space o 2 dau
            return value.trim() ? undefined : message || "Vui lòng nhập trường này"
        }
    }
},
Validator.isRadioCheckbox =  function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || "Vui lòng nhập trường này"
        }
    }
},
Validator.isFullname =  function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            // fullname regexp format from https://regexr.com/39c7p
            // const regex 
            // value.trim() de loai bo khoang trong khi nguoi dung nhap phim space o 2 dau
            return value.trim().match(" ") ? undefined : message || "Vui lòng nhập trường này"
        }
    }
},
Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            // mail regexp format from https://www.w3resource.com/javascript/form/email-validation.php 
            const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            // Kiem tra 1 chuoi co phai la email hop le hay khong value.match(regex))||regex.test(value);
            return value.match(regex) ? undefined : message || "Vui lòng nhập trường này"
        }
    }
},
Validator.isPassword = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            // password regexp format from https://www.w3resource.com/javascript/form/password-validation.php
            const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
            // Kiem tra 1 chuoi co phai la email hop le hay khong value.match(regex))||regex.test(value);
            return value.match(regex) ? undefined : message || "Vui lòng nhập trường này"
        }
    }
}
Validator.isConfigPassword = function (selector, callbackfunction, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === callbackfunction() ? undefined : message || "Vui lòng nhập trường này"
        }
    }
}

