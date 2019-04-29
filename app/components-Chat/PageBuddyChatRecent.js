import React from 'react';




class PageBuddyChatRecent extends React.Component {
    render() {
        return (

        );
    }

    loadmore () => {
    const { buddy, chatIds, chatById } = this.props;
        this.context.uc.getBuddyChats(buddy.id, query)

    }
}