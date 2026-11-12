import { browser, by, element, ElementArrayFinder, ExpectedConditions as EC } from 'protractor';

const byTest = (name: string) => by.css(`[data-test="${name}"]`);

export class InventoryPage {
  async openList(): Promise<void> {
    await browser.get(browser.baseUrl + 'items');
    await browser.wait(EC.presenceOf(element(byTest('item-row'))), 10000);
  }

  rows(): ElementArrayFinder {
    return element.all(byTest('item-row'));
  }

  async rowNames(): Promise<string[]> {
    return element.all(byTest('cell-name')).getText() as Promise<any>;
  }

  async addItem(name: string, quantity: number, price: number): Promise<void> {
    await element(byTest('add')).click();
    await element(byTest('name')).sendKeys(name);
    for (const [field, value] of [['quantity', quantity], ['price', price]] as const) {
      const input = element(byTest(field));
      await input.clear();
      await input.sendKeys(String(value));
    }
    await element(byTest('save')).click();
    // Back on the list once saved. (The "Saved" message is not checked: it disappears after 3 s,
    // which is shorter than one Protractor step under Rosetta.)
    await browser.wait(async () => (await browser.getCurrentUrl()).endsWith('/items'), 10000);
    await browser.wait(EC.presenceOf(element(byTest('item-row'))), 10000);
  }
}
