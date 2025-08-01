import { visit } from 'unist-util-visit';
import { v4 as isUuid } from 'uuid';

export default function linkPlugin() {
  return (tree) => {
    visit(tree, ['text'], (node, index, parent) => {
      const regex = /\[\[(.*?)\]\]/g;
      let match;
      let lastIndex = 0;
      const newChildren = [];

      while ((match = regex.exec(node.value)) !== null) {
        const uuid = match[1];
        if (lastIndex < match.index) {
          newChildren.push({ type: 'text', value: node.value.slice(lastIndex, match.index) });
        }
        newChildren.push({
          type: 'link', // Change this to 'link'
          url: `uuid:${uuid}`, // Use the 'url' property for the UUID
          children: [{ type: 'text', value: `[[${uuid}]]` }],
        });
        lastIndex = regex.lastIndex;
      }

      if (lastIndex < node.value.length) {
        newChildren.push({ type: 'text', value: node.value.slice(lastIndex) });
      }

      if (newChildren.length > 1 || (newChildren.length === 1 && newChildren[0].type !== 'text')) {
        parent.children.splice(index, 1, ...newChildren);
      }
    });
  };
}