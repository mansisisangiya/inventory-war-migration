import { InventoryPage } from './inventory.po';

describe('Inventory app', () => {
  const page = new InventoryPage();

  it('lists the items', async () => {
    await page.openList();
    expect(await page.rows().count()).toBeGreaterThanOrEqual(4);
    expect(await page.rowNames()).toContain('Steel bolts');
  });

  it('adds an item', async () => {
    const name = `E2E item ${Date.now()}`;
    await page.openList();
    await page.addItem(name, 4, 12.5);
    expect(await page.rowNames()).toContain(name);
  });
});
