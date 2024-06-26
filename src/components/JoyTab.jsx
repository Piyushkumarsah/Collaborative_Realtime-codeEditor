import React, { useState, useEffect } from 'react';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab from '@mui/joy/Tab';
import TabPanel from '@mui/joy/TabPanel';

import CodeBox from './CodeBox';

const JoyTab = ({ last, tabs, roomId, name, socket }) => {
    const [tabVal, setTabVal] = useState(name);
    const handleTabChange = (event, newValue) => {
        console.log(newValue);
        setTabVal(newValue);
    };

    return (
        <Tabs aria-label="Basic tabs" value={tabVal} sx={{ backgroundColor: "#131417", color: "white" }} onChange={handleTabChange}>
            <TabList sx={{ color: "white" }} >
                {
                    tabs.map((item, idx) => (
                        <Tab
                            key={item.id}
                            value={item.userName}
                            sx={{
                                color: item.userName === tabVal ? "black" : "white",
                            }}
                        >
                            {item.userName}
                        </Tab>
                    ))
                }
            </TabList>
            {
                tabs.map((item, idx) => (
                    <TabPanel key={idx} keepMounted value={item.userName}>
                        <CodeBox tabId={item.id} roomId={roomId} socket={socket} name={item.userName} ></CodeBox>
                    </TabPanel>
                ))

            }
        </Tabs>
    );
}

export default JoyTab;
