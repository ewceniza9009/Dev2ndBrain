import { visit } from 'unist-util-visit';

export default function linkPlugin() {
  return (tree) => {
    visit(tree, ['text'], (node, index, parent) => {
      const regex = /\[\[([0-9a-fA-F-]{36})\]\]/g;
      let match;
      let lastIndex = 0;
      const newChildren = [];

      while ((match = regex.exec(node.value)) !== null) {
        const uuid = match[1];
        if (lastIndex < match.index) {
          newChildren.push({ type: 'text', value: node.value.slice(lastIndex, match.index) });
        }
        newChildren.push({
          type: 'd-link', // Use a custom node type
          uuid: uuid,
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