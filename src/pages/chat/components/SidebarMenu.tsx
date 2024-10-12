import "../../../assets/style/pages/chat/SidebarMenu.css";
import { Button, GetProps, Input, Menu, MenuProps } from "antd";
import {
  UserOutlined,
  CommentOutlined,
  FormOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import Sider from "antd/es/layout/Sider";
import React, { useEffect, useState } from "react";
import { AuthenticationContextProp } from "../../../components/auth/types/AuthenticationContextProp.interface";
import { useAuth } from "../../../components/auth/AuthenticationProvider";
import { Conversation } from "../../../services/conversation/types/conversation.dto";
import { ListApiResponse } from "../../../types/list-api-response.dto";
import { Membership } from "../../../services/membership/types/membership.dto";
import { GetParticipatedConversation } from "../../../services/membership/membership.service";
import { CreateConversationModal } from "../modal/CreateConversation.modal";

type SideBarItem = Required<MenuProps>["items"][number];

type SearchProps = GetProps<typeof Input.Search>;

const { Search } = Input;

// TODO: update the conversation content to show the searching conversations
const onSearch: SearchProps["onSearch"] = (value, _e, info) => {
  console.log("value:", value);
};

export const SidebarMenu: React.FC = () => {
  const authContext: AuthenticationContextProp = useAuth();
  const [sidebarData, setSidebarData] = useState<SideBarItem[]>([]);
  const [activeConversation, setActiveConversation] = useState<string>("");
  const [
    isCreateConversationModalVisible,
    setIsCreateConversationModalVisible,
  ] = useState<boolean>(false);

  const fetchParticipatedConversation: any = async () => {
    const userMembershipWithConversations: ListApiResponse<Membership> =
      await GetParticipatedConversation(authContext.accessToken);
    const SideBarItems: SideBarItem[] =
      userMembershipWithConversations.data.map((membership) => {
        const conversation: Conversation = membership.conversation;
        if (!conversation || !conversation.name) {
          authContext.logoutAction();
        }

        let conversationLabel: string = conversation.name;
        let privateConversationId: string | null = null;
        const match = conversation.name.match(/\[(.*?)\]/);
        if (match && match[1]) {
          privateConversationId = match[1];
        }
        if (privateConversationId && membership.partner) {
          conversationLabel = `${membership.partner.lastName} ${membership.partner.firstName}`;
        }

        return {
          key: conversation.id,
          icon: <CommentOutlined />,
          label: conversationLabel,
        };
      });
    setSidebarData(SideBarItems);
  };

  useEffect(() => {
    const execDefaultProcess: any = async () => {
      await fetchParticipatedConversation();
    };

    execDefaultProcess();
  }, []);

  const handleCreateNewItemButtonClicked: any = async (event: any) => {
    event.preventDefault();
    setIsCreateConversationModalVisible(true);
  };

  // TODO: Implement user profile page
  const handleProfileButtonClicked = (event: any) => {
    event.preventDefault();
    console.log("Go to profile");
  };

  // TODO: Show the message component and update url with conversaiton id
  const handleSidebarItemSelected: MenuProps["onClick"] = (event: any) => {
    if (event.key === activeConversation) {
      return;
    }
    console.log("Choosing conversation:", event.key);
    setActiveConversation(event.key);
    localStorage.setItem("activeConversation", event.key);
  };

  const handleLogout = () => {
    localStorage.removeItem("activeConversation");
    authContext.logoutAction();
  };

  return (
    <Sider className="chat-sidebar" width={300}>
      <div className="sidebar-header">
        <div className="user-section">
          <Button
            className="profile-button"
            icon={<UserOutlined />}
            shape="circle"
            onClick={handleProfileButtonClicked}
            variant="outlined"
          />
          <p className="full-name">
            {authContext.userInformation
              ? authContext.userInformation.fullName
              : "Loading..."}
          </p>
          <Button
            className="logout-button"
            onClick={handleLogout}
            icon={<LogoutOutlined />}
            danger
          />
        </div>
        <div className="tool-box">
          <div className="search-and-new-section">
            <Button
              className="create-new-item"
              icon={<FormOutlined />}
              onClick={handleCreateNewItemButtonClicked}
              variant="outlined"
            />
            <Search
              placeholder="input search text"
              onSearch={onSearch}
              enterButton
              name="conversation-search-box"
            />
          </div>
        </div>
      </div>
      <Menu
        className="conversation-list"
        mode="inline"
        theme="dark"
        items={sidebarData}
        onClick={handleSidebarItemSelected}
        selectedKeys={[activeConversation]}
      />
      <CreateConversationModal
        visible={isCreateConversationModalVisible}
        onClose={() => setIsCreateConversationModalVisible(false)}
        onSuccess={fetchParticipatedConversation}
      />
    </Sider>
  );
};
