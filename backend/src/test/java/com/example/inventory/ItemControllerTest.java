package com.example.inventory;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ItemControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void listsSeededItems() throws Exception {
        mvc.perform(get("/api/items")).andExpect(status().isOk()).andExpect(jsonPath("$[0].name").value("Steel bolts"));
    }

    @Test
    void rejectsInvalidItem() throws Exception {
        mvc.perform(post("/api/items").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"\"}"))
           .andExpect(status().isBadRequest());
    }

    @Test
    void missingItemIs404() throws Exception {
        mvc.perform(get("/api/items/999")).andExpect(status().isNotFound());
    }
}
