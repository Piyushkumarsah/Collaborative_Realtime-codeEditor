import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from 'react-avatar';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
// import DeleteIcon from '@mui/icons-material/Delete';


const Demo = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    overflowY: 'auto', // Ensure overflow scrolling
    maxHeight: 'calc(100vh - 250px)',
    height: 'calc(100vh - 285px)', // Set a maximum height to trigger scrolling
    backgroundColor:"#1e1f26"
}));


export default function InteractiveList({ tabs }) {
    const [dense, setDense] = React.useState(true);
    const [secondary, setSecondary] = React.useState(false);
    function generate(element) {
        return tabs.map((value) =>
            React.cloneElement(element, {
                key: value.userName,
            }),
        );
    }
    return (
        <Box className="h-full text-white" sx={{backgroundColor:"#131417"}}>
            <Grid className='border-2' container spacing={0}>
                <Grid className=' w-full' item xs={12} md={0}>
                    <Typography sx={{ mt: 4, mb: 2 }} className='text-center' variant="h6" component="div">
                            CONNECTED CLIENTS
                    </Typography>
                    <Demo className='h-full w-full'>
                        <List className='w-full' dense={dense}>

                            {
                                tabs.map((item) => (
                                    <ListItem className=''>
                                        <ListItemAvatar>
                                            <Avatar size={30} name={item.userName} round='14px' />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={item.userName}
                                            secondary={secondary ? 'Secondary text' : null}
                                        />
                                    </ListItem>
                                ))
                            }
                        </List>
                    </Demo>
                </Grid>
            </Grid>
        </Box>
    );
}
