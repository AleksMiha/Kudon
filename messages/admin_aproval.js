module.exports = {
    "text": "User {} wants to send kudos to {}, ",
    "attachments": [
        {
            "text": "Building buttons is easy right?",
            "fallback": "Shame... buttons aren't supported in this land",
            "callback_id": "accept",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "yes",
                    "text": "yes",
                    "type": "button",
                    "value": "yes"
                },
                {
                    "name": "no",
                    "text": "no",
                    "type": "button",
                    "value": "no"
                }
            ]
        }
    ]   
}