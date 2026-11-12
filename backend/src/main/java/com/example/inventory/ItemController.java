package com.example.inventory;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;
import javax.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** In-memory list/add/edit API. Stub only: the backend is not part of the Angular migration. */
@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final Map<Long, Item> items = new ConcurrentHashMap<>();
    private final AtomicLong ids = new AtomicLong();

    public ItemController() {
        add(new Item(null, "Steel bolts", 540, 0.12));
        add(new Item(null, "Safety gloves", 64, 4.50));
        add(new Item(null, "Cordless drill", 9, 89.00));
        add(new Item(null, "Cable ties", 1200, 0.03));
    }

    private Item add(Item item) {
        long id = ids.incrementAndGet();
        item.setId(id);
        items.put(id, item);
        return item;
    }

    @GetMapping
    public List<Item> list() {
        return items.values().stream()
                .sorted(Comparator.comparing(Item::getId))
                .collect(Collectors.toCollection(ArrayList::new));
    }

    @GetMapping("/{id}")
    public Item get(@PathVariable long id) {
        Item item = items.get(id);
        if (item == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Item " + id + " not found");
        return item;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Item create(@Valid @RequestBody Item item) {
        return add(item);
    }

    @PutMapping("/{id}")
    public Item update(@PathVariable long id, @Valid @RequestBody Item item) {
        get(id);
        item.setId(id);
        items.put(id, item);
        return item;
    }
}
