const formatChatText = txt =>
  txt && txt.replace(/<br\s*[/]?>/gi, '\r\n').replace(/<[^>]*>/g, '');

export default formatChatText;
