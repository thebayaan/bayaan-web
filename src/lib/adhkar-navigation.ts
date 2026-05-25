import { getCategoryById, getDhikrByCategory, type Dhikr } from "@/data/adhkar-data";
import { ALL_ADHKAR_SUPER, resolveAdhkarSuperSlug } from "@/data/adhkar-super-categories";

export interface AdhkarCategorySection {
  categoryId: string;
  title: string;
  dhikrList: Dhikr[];
}

/** Ordered dhikr list for a super-category slug or numeric category id. */
export function getDhikrSequence(superId: string): Dhikr[] {
  const slug = resolveAdhkarSuperSlug(superId);
  const superCategory = slug ? ALL_ADHKAR_SUPER.find((s) => s.id === slug) : null;
  if (superCategory) {
    return superCategory.categoryIds.flatMap((id) => getDhikrByCategory(id));
  }
  return getDhikrByCategory(superId);
}

/** Group dhikr by child category when a super-category spans multiple collections. */
export function getDhikrSections(superId: string): AdhkarCategorySection[] {
  const slug = resolveAdhkarSuperSlug(superId);
  const superCategory = slug ? ALL_ADHKAR_SUPER.find((s) => s.id === slug) : null;

  if (superCategory) {
    return superCategory.categoryIds
      .map((categoryId) => {
        const category = getCategoryById(categoryId);
        const dhikrList = getDhikrByCategory(categoryId);
        if (!category || dhikrList.length === 0) return null;
        return { categoryId, title: category.title, dhikrList };
      })
      .filter((section): section is AdhkarCategorySection => section !== null);
  }

  const category = getCategoryById(superId);
  const dhikrList = getDhikrByCategory(superId);
  if (!category || dhikrList.length === 0) return [];
  return [{ categoryId: category.id, title: category.title, dhikrList }];
}

export function getDhikrNeighbors(
  superId: string,
  dhikrId: string,
): { prev: Dhikr | null; next: Dhikr | null; index: number; total: number } {
  const list = getDhikrSequence(superId);
  const index = list.findIndex((d) => d.id === dhikrId);
  if (index === -1) return { prev: null, next: null, index: -1, total: list.length };
  return {
    prev: index > 0 ? (list[index - 1] ?? null) : null,
    next: index < list.length - 1 ? (list[index + 1] ?? null) : null,
    index,
    total: list.length,
  };
}
