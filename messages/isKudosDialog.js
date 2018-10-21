module.exports = {
    "text": "Do you want to send some kudos?",
    "attachments": [
        {
            "fallback": "You don't want to send kudos",
            "callback_id": "dialog",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "accept",
                    "text": "Yes",
                    "type": "button",
                    "value": "yes"
                },
                {
                    "name": "accept",
                    "text": "No",
                    "type": "button",
                    "value": "no",
                    "style": "danger",
                }
            ]
        }
    ]
}