package com.example.inventory;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Sends Angular client-side routes (e.g. /items/3/edit) to index.html so a browser
 * refresh on a deep link works. Segments containing a dot (static files) are not matched,
 * and the more specific /api/** mappings in ItemController always win over these patterns.
 */
@Controller
public class SpaForwardingController {
    @GetMapping({
        "/{a:[^\\.]*}",
        "/{a:[^\\.]*}/{b:[^\\.]*}",
        "/{a:[^\\.]*}/{b:[^\\.]*}/{c:[^\\.]*}"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
