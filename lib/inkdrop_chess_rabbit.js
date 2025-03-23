'use babel';

import InkdropChessRabbitMessageDialog from './inkdrop_chess_rabbit_message_dialog';

module.exports = {

  activate() {
    inkdrop.components.registerClass(InkdropChessRabbitMessageDialog);
    inkdrop.layouts.addComponentToLayout(
      'modal',
      'InkdropChessRabbitMessageDialog'
    )
  },

  deactivate() {
    inkdrop.layouts.removeComponentFromLayout(
      'modal',
      'InkdropChessRabbitMessageDialog'
    )
    inkdrop.components.deleteClass(InkdropChessRabbitMessageDialog);
  }

};
