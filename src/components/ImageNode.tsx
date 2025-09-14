"use client";

import { DecoratorNode, LexicalEditor, NodeKey } from "lexical";

function ImageComponent({ src }: { src: string }) {
  return <img src={src} alt="" className="max-w-full h-auto rounded" />;
}

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;

  static getType() {
    return "image";
  }

  static clone(node: ImageNode) {
    return new ImageNode(node.__src, node.__key);
  }

  constructor(src: string, key?: NodeKey) {
    super(key);
    this.__src = src;
  }

  createDOM(): HTMLElement {
    return document.createElement("span");
  }

  updateDOM(): false {
    return false;
  }

  decorate(editor: LexicalEditor): JSX.Element {
    return <ImageComponent src={this.__src} />;
  }
}

export function $createImageNode(src: string) {
  return new ImageNode(src);
}
