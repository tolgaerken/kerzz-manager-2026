import type { TPermission, TreeNode } from "../types";

/**
 * Build a tree structure from flat permission list
 * Permissions with parentId are nested under their parent
 */
export function buildPermissionTree(permissions: TPermission[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // First pass: create all nodes
  permissions.forEach((permission) => {
    nodeMap.set(permission.id, {
      id: permission.id,
      permission,
      children: [],
      level: 0,
      isExpanded: true
    });
  });

  // Second pass: build tree structure
  permissions.forEach((permission) => {
    const node = nodeMap.get(permission.id);
    if (!node) return;

    if (permission.parentId && nodeMap.has(permission.parentId)) {
      const parent = nodeMap.get(permission.parentId)!;
      node.level = parent.level + 1;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

/**
 * Flatten a tree structure back to a list
 * Useful for rendering in a table with indentation
 */
export function flattenTree(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];

  function traverse(node: TreeNode) {
    result.push(node);
    if (node.isExpanded) {
      node.children.forEach(traverse);
    }
  }

  nodes.forEach(traverse);
  return result;
}

/**
 * Get all descendant IDs of a node
 */
export function getDescendantIds(node: TreeNode): string[] {
  const ids: string[] = [];

  function traverse(n: TreeNode) {
    n.children.forEach((child) => {
      ids.push(child.id);
      traverse(child);
    });
  }

  traverse(node);
  return ids;
}

/**
 * Get all ancestor IDs of a permission
 */
export function getAncestorIds(
  permissionId: string,
  permissions: TPermission[]
): string[] {
  const ids: string[] = [];
  const permissionMap = new Map(permissions.map((p) => [p.id, p]));

  let current = permissionMap.get(permissionId);
  while (current?.parentId) {
    ids.push(current.parentId);
    current = permissionMap.get(current.parentId);
  }

  return ids;
}

/**
 * Toggle expansion state of a node
 */
export function toggleNodeExpansion(
  nodes: TreeNode[],
  nodeId: string
): TreeNode[] {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return { ...node, isExpanded: !node.isExpanded };
    }
    if (node.children.length > 0) {
      return { ...node, children: toggleNodeExpansion(node.children, nodeId) };
    }
    return node;
  });
}

/**
 * Expand all nodes
 */
export function expandAll(nodes: TreeNode[]): TreeNode[] {
  return nodes.map((node) => ({
    ...node,
    isExpanded: true,
    children: expandAll(node.children)
  }));
}

/**
 * Collapse all nodes
 */
export function collapseAll(nodes: TreeNode[]): TreeNode[] {
  return nodes.map((node) => ({
    ...node,
    isExpanded: false,
    children: collapseAll(node.children)
  }));
}

/**
 * Group permissions by their group field
 */
export function groupPermissionsByGroup(
  permissions: TPermission[]
): Map<string, TPermission[]> {
  const groups = new Map<string, TPermission[]>();

  permissions.forEach((permission) => {
    const group = permission.group || "Diğer";
    if (!groups.has(group)) {
      groups.set(group, []);
    }
    groups.get(group)!.push(permission);
  });

  return groups;
}

/**
 * Sort permissions by group and then by name
 */
export function sortPermissions(permissions: TPermission[]): TPermission[] {
  return [...permissions].sort((a, b) => {
    // First sort by group
    const groupCompare = a.group.localeCompare(b.group);
    if (groupCompare !== 0) return groupCompare;

    // Then by permission name
    return a.permission.localeCompare(b.permission);
  });
}

/**
 * Filter permissions by search query
 */
export function filterPermissions(
  permissions: TPermission[],
  query: string
): TPermission[] {
  if (!query.trim()) return permissions;

  const lowerQuery = query.toLowerCase();
  return permissions.filter(
    (p) =>
      p.permission.toLowerCase().includes(lowerQuery) ||
      p.group.toLowerCase().includes(lowerQuery) ||
      p.description?.toLowerCase().includes(lowerQuery)
  );
}
