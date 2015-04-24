"use strict";

var VCAP_SERVICES = process.env.VCAP_SERVICES ? JSON.parse(process.env.VCAP_SERVICES) : undefined;

var qa = {
    hostname: VCAP_SERVICES ? VCAP_SERVICES['question_and_answer'][0].name : undefined,
    username: VCAP_SERVICES ? VCAP_SERVICES['question_and_answer'][0].credentials.username : undefined,
    passwd: VCAP_SERVICES ? VCAP_SERVICES['question_and_answer'][0].credentials.password : undefined,
    url: VCAP_SERVICES ? VCAP_SERVICES['question_and_answer'][0].credentials.url : undefined
};

// Stone modify
var speech_to_text = {
    url: VCAP_SERVICES ? VCAP_SERVICES['speech_to_text'][0].credentials.url : undefined,
    username: VCAP_SERVICES ? VCAP_SERVICES['speech_to_text'][0].credentials.username : undefined,
    password: VCAP_SERVICES ? VCAP_SERVICES['speech_to_text'][0].credentials.password : undefined,
    //version: VCAP_SERVICES ? "v1" : undefined
};

module.exports = {
    qa: qa,
// Stone modify
    speech_to_text: speech_to_text
};
