import { Meta, StoryFn } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { TestContext } from '../../test';
import Details from './Details';
import { NODE_DUMMY_DATA } from './storyHelper';

export default {
  title: 'Node/DetailsView',
  component: Details,
  argTypes: {},
  decorators: [
    Story => {
      return (
        <TestContext routerMap={{ name: 'node' }}>
          <Story />
        </TestContext>
      );
    },
  ],
  parameters: {
    msw: {
      handlers: {
        storyBase: [
          http.get('http://localhost:4466/apis/gateway.networking.k8s.io/v1/nodes', () =>
            HttpResponse.error()
          ),
          http.get('http://localhost:4466/api/v1/namespaces/default/events', () =>
            HttpResponse.json({
              kind: 'EventList',
              items: [],
              metadata: {},
            })
          ),
        ],
      },
    },
  },
} as Meta;

const Template: StoryFn = () => {
  return <Details />;
};

export const Basic = Template.bind({});
Basic.args = {
  nodeJson: NODE_DUMMY_DATA,
};
Basic.parameters = {
  msw: {
    handlers: {
      story: [
        http.get('http://localhost:4466/apis/gateway.networking.k8s.io/v1/nodes/node', () =>
          HttpResponse.json(NODE_DUMMY_DATA)
        ),
      ],
    },
  },
};
