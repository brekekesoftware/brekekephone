export default function formatChatText_s(str) {
    if(!str){
        return "";
    }

    str = str.replace(/<br\s*[\/]?>/gi, "\r\n");  ///<br> to newLine

    str = str.replace(/<[^>]*>/g, '');
    return str;
}
